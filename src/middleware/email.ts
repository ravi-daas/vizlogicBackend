import { Request, Response, NextFunction } from "express";

export const sendEmail = (req: Request, res: Response, next: NextFunction): void => {
    try {

    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};