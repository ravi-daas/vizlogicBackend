import express, { Router, Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Client } from "../database/models/Client"; // Import Client model
import { protect } from "../middleware/auth";

const router = express.Router();

// Get all clients
router.get("/allclients", protect, async (req: Request, res: Response) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// create new client
router.post(
    "/newclient", protect,
    [
        body("businessName").notEmpty().withMessage("Business Name is required"),
        body("clientIndustry").notEmpty().withMessage("Client Industry is required"),
        body("country").notEmpty().withMessage("Country is required"),
        body("city").optional(),
        body("businessGSTIN").optional().isLength({ min: 15, max: 15 }).withMessage("GSTIN must be 15 characters"),
        body("businessPAN").optional().isLength({ min: 10, max: 10 }).withMessage("PAN must be 10 characters"),
    ],
    async (req: Request, res: Response): Promise<any> => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const client = Client.build(req.body);
            await client.save();
            res.status(201).json({ message: "Client created successfully", client });
        } catch (error) {
            console.error("Error creating client:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// update client with id
router.put(
    "/updateclient/:clientId", protect,
    [
        param("clientId").isMongoId().withMessage("Invalid Client ID"),
        body("businessName").optional().notEmpty().withMessage("Business Name cannot be empty"),
        body("clientIndustry").optional().notEmpty().withMessage("Client Industry cannot be empty"),
        body("country").optional().notEmpty().withMessage("Country cannot be empty"),
        body("city").optional().isString(),
        body("businessGSTIN").optional().isString(),
        body("businessPAN").optional().isString(),
    ],
    async (req: Request, res: Response): Promise<any> => {

        const { clientId } = req.params;
        const updates = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No data provided for update" });
        }


        try {
            // Find client by ID and update
            const updatedClient = await Client.findByIdAndUpdate(clientId, updates, { new: true });

            if (!updatedClient) {
                return res.status(404).json({ message: "Client not found" });
            }

            res.json({ message: "Client updated successfully", client: updatedClient });
        } catch (error) {
            console.error("Update error:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// delete client by id
router.delete(
    "/deleteclient/:id", protect,
    [param("id").isMongoId().withMessage("Invalid Client ID")],
    async (req: Request, res: Response): Promise<any> => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const client = await Client.findByIdAndDelete(req.params.id);
            if (!client) return res.status(404).json({ message: "Client not found" });

            res.json({ message: "Client deleted successfully" });
        } catch (error) {
            console.error("Error deleting client:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

export { router as clientRouter };
