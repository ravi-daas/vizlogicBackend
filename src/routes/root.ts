import express, { Router, Request, Response } from "express";

const router = express.Router();

// Get all clients
router.get("/", async (req: Request, res: Response) => {
    try {
        res.json({message:"Sever is Running"});
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export { router as rootRouter };
