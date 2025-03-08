import { Request, Response, NextFunction } from "express";

interface CustomError extends Error {
  statusCode?: number;
}

const ErrorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction): void => {
  console.log("Middleware Error Handling");
  
  const errStatus = err.statusCode || 500;
  console.log(err.message);
  
  const errMsg = "Something went wrong";

  res.status(errStatus).json({
    success: false,
    status: errStatus,
    message: errMsg,
    // stack: process.env.NODE_ENV === "development" ? err.stack : {}
  });

  return;
};

export default ErrorHandler;
