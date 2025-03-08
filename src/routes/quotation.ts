import express, { Request, Response } from "express";
import { body, param, validationResult, query } from "express-validator";
import { Quotation } from "../database/models/Quotation";
import { protect } from "../middleware/auth";

const router = express.Router();

// Get All Quotations
router.get("/allQuotations", protect, async (req: Request, res: Response) => {
    try {
        const invoices = await Quotation.find();
        res.json(invoices);
    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get Quotation by ID
router.get(
    "/getQuotation/:id", protect,
    [param("id").isMongoId().withMessage("Invalid Quotation ID")],
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const quotation = await Quotation.findById(req.params.id);
            if (!quotation) return res.status(404).json({ message: "Quotation not found" });

            res.json(quotation);
        } catch (error) {
            console.error("Error fetching quotation:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// Create New Quotation
router.post(
    "/newQuotation", protect,
    [
        body("quotationNumber").notEmpty().withMessage("Quotation Number is required"),
        body("quotationDate").notEmpty().withMessage("Quotation Date is required"),
        body("dueDate").notEmpty().withMessage("Due Date is required"),
        body("billedBy").notEmpty().withMessage("Billed By is required"),
        body("billedTo").notEmpty().withMessage("Billed To is required"),
        body("currency").optional(),
        body("taxType").optional(),
        body("gstType").optional(),
        body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
        body("items.*.name").notEmpty().withMessage("Item name is required"),
        body("items.*.quantity").notEmpty().isNumeric().withMessage("Quantity must be a number"),
        body("items.*.rate").optional(), // Rate will be calculated
        body("items.*.gstRate").optional().isNumeric().withMessage("GST Rate must be a number"),
        body("subTotal").optional(), // Subtotal will be calculated
        body("logo").optional(),
        body("signature").optional(),
    ],
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let { items } = req.body;
            let subTotal = 0;

            console.log(req.body);


            // Calculate Total Cost for Each Item & Subtotal
            items = items.map((item: any) => {
                const price = parseFloat(item.rate); // Assuming rate is price per unit
                const quantity = parseInt(item.quantity);
                const gstRate = item.gstRate ? parseFloat(item.gstRate) : 0;

                const totalAmount = price * quantity + (price * quantity * gstRate) / 100;
                subTotal += totalAmount;

                return { ...item, totalAmount: totalAmount.toFixed(2) };
            });

            req.body.items = items;
            req.body.subTotal = subTotal.toFixed(2);

            // const quotation = await Quotation.create(req.body);

            const quotation = Quotation.build(req.body);
            await quotation.save();

            res.status(201).json({ message: "Quotation created successfully", quotation });
        } catch (error) {
            console.error("Error creating quotation:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// Update Quotation 
router.put(
    "/updateQuotation/:id", protect,
    [
        param("id").isMongoId().withMessage("Invalid Quotation ID"),
        body("quotationDate").optional().notEmpty().withMessage("Quotation Date is required"),
        body("dueDate").optional().notEmpty().withMessage("Due Date is required"),
        body("billedBy").optional().notEmpty().withMessage("Billed By is required"),
        body("billedTo").optional().notEmpty().withMessage("Billed To is required"),
        body("items").optional().notEmpty().isArray({ min: 1 }).withMessage("At least one item is required"),
        body("items").optional().isArray().withMessage("Items must be an array"),
        body("items.*.quantity").optional().isNumeric().withMessage("Quantity must be a number"),
        body("items.*.rate").optional(), // Will be calculated again
        body("items.*.gstRate").optional().isNumeric().withMessage("GST Rate must be a number"),
        body("subTotal").optional(), // Will be recalculated
    ],
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let quotation = await Quotation.findById(req.params.id);
            if (!quotation) return res.status(404).json({ message: "Quotation not found" });

            let { items } = req.body;
            let subTotal = 0;

            console.log(items);
            console.log(req.body);



            if (items) {
                // Recalculate Total Cost for Updated Items
                items = items.map((item: any) => {
                    const price = parseFloat(item.rate);
                    const quantity = parseInt(item.quantity);
                    const gstRate = item.gstRate ? parseFloat(item.gstRate) : 0;

                    const totalAmount = price * quantity + (price * quantity * gstRate) / 100;
                    subTotal += totalAmount;

                    return { ...item, totalAmount: totalAmount.toFixed(2) };
                });

                req.body.items = items;
                req.body.subTotal = subTotal.toFixed(2);
            }

            quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });

            res.json({ message: "Quotation updated successfully", quotation });
        } catch (error) {
            console.error("Error updating quotation:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// Delete Quotation
router.delete(
    "/deleteQuotation/:id", protect,
    [param("id").isMongoId().withMessage("Invalid Quotation ID")],
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const quotation = await Quotation.findByIdAndDelete(req.params.id);
            if (!quotation) return res.status(404).json({ message: "Quotation not found" });

            res.json({ message: "Quotation deleted successfully" });
        } catch (error) {
            console.error("Error deleting quotation:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

router.post('/shareQuotation', protect,
    [
        query("source")
            .isIn(["email", "whatsapp"])
            .withMessage("Source must be 'email' or 'whatsapp'"),

        body("quotationId").notEmpty().withMessage('Quotation Id is required').bail()
            .isMongoId().withMessage("Invalid Invoice ID"),
        body('emailId').optional().notEmpty().withMessage('Email Id is required').bail().isEmail().withMessage("Invalid email id"),
        body('whatsappNumber').optional().notEmpty().withMessage('Whatsapp Number is required').matches(/^[0-9]{10}$/)
            .withMessage("Phone number must be a 10-digit number"),

    ],
    async (req: Request, res: Response): Promise<any> => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const source = req.query.source;
        const body = req.body;
        if (source === 'email') {

            if (body.emailId == null) {
                res.json({ message: `No emailId provided for source=${source}` });
                return;
            }

            // function to send invoice to email

            res.json({ message: `Invoice sent successfully via - ${source}` });
            return;
        } else if (source === 'whatsapp') {
            if (body.whatsappNumber == null) {
                res.json({ message: `No whatsappNumber provided for source=${source}` });
                return;
            }

            // function to send invoice to whatsapp
            res.json({ message: `Invoice sent successfully via - ${source}` });
            return;
        }

    }
);

export { router as quotationRouter };
