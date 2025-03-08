import express, { Request, Response } from "express";
import { body, param, validationResult } from "express-validator";
import { Product } from "../database/models/Product"; // Import the Product model
import { protect } from "../middleware/auth";

const router = express.Router();

// Get All Products
router.get("/allProducts", protect, async (req: Request, res: Response) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Create a New Product
router.post(
    "/newProduct", protect,
    [
        body("productName").notEmpty().withMessage("Product name is required"),
        body("sku").notEmpty().withMessage("SKU is required"),
        body("hsnCode").notEmpty().withMessage("HSN Code is required"),
        body("category").notEmpty().withMessage("Category is required"),
        body("quantity").isInt({ min: 0 }).withMessage("Quantity must be a positive integer"),
        body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    ],
    async (req: Request, res: Response): Promise<any> => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {

            const { productName, sku, hsnCode, category, quantity, price, status } = req.body;

            const product = Product.build({ productName, sku, hsnCode, category, quantity, price, status });

            await product.save();
            res.status(201).json({ message: "Product created successfully", product });
        } catch (error) {
            console.error("Error creating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// Update an Existing Product
router.put(
    "/updateProduct/:id", protect,
    [
        param("id").isMongoId().withMessage("Invalid Product ID"),
        body("productName").optional().notEmpty().withMessage("Product name cannot be empty"),
        body("sku").optional().notEmpty().withMessage("SKU cannot be empty"),
        body("hsnCode").optional().notEmpty().withMessage("HSN Code cannot be empty"),
        body("category").optional().notEmpty().withMessage("Category cannot be empty"),
        body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be a positive integer"),
        body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    ],
    async (req: Request, res: Response): Promise<any> => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const updates = req.body;

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({ message: "No data provided for update" });
            }

            const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });

            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.json({ message: "Product updated successfully", product: updatedProduct });
        } catch (error) {
            console.error("Error updating product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

// Delete a Product
router.delete(
    "/deleteProduct/:id", protect,
    [param("id").isMongoId().withMessage("Invalid Product ID")],
    async (req: Request, res: Response): Promise<any> => {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { id } = req.params;
            const deletedProduct = await Product.findByIdAndDelete(id);

            if (!deletedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            res.json({ message: "Product deleted successfully" });
        } catch (error) {
            console.error("Error deleting product:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    }
);

export { router as productRouter };
