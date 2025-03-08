import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";

const router: Router = express.Router();

router.post(
    "/login",
    [
        body("email")
            .notEmpty().withMessage("Email is required")
            .bail()
            .isEmail().withMessage("Invalid email format"),

        body("password")
            .notEmpty().withMessage("Password is required")
            .bail()
            .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    ],
    async (req: Request, res: Response): Promise<any> => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Generate a dummy JWT token
            const token = jwt.sign({ email }, "dummy_secret", { expiresIn: "1h" });

            return res.json({ message: "Login Successful", token });
        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
);



export { router as authRouter };
