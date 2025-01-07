import { Request, Response, NextFunction } from "express";
import { userController } from "../types/types.js";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): Response<any, Record<string, any>> => {
  err.message ||= "internal server error";
  err.statusCode ||= 500;
  if (err.name === "CastError") err.message = "Invalid Id";
  // Handle the error
  return res.status(500).json({ error: err.message });
};

export const tryCatch= (func: userController) => (req: Request, res: Response, next: NextFunction) =>  
  (func: userController) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(func(req, res, next)).catch(next);
  };



export default errorMiddleware;
