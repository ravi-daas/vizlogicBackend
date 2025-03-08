
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction): void => {
    let token = req.cookies?.token; // Try to get from cookies

    if (!token && req.headers.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Extract from header
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized" });
        return;
    }

    try {
        const decoded = jwt.verify(token, "dummy_secret") as { id: string };
        (req as any).user = decoded.id; // Attach user ID to request
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
