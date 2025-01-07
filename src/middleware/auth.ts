import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.models.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { tryCatch } from "./errorMiddleware.js";
import jwt from "jsonwebtoken";
import { newUserDataType } from "../types/types.js";


// this is admin should apply after regsiter
export const adminOnly = tryCatch(async (req, res, next) => {
  const { id } = req.query;

  // Check if an ID is provided
  if (!id) return next(new ErrorHandler("Sign in First", 401));

  // Find the user by ID
  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Invalid Id", 401));

  // Check if the user is an admin
  if (user.role !== "admin")
    return next(new ErrorHandler("You cannot access this resource", 403));

  next();
});



interface AuthenticatedRequest extends Request {
  user?: newUserDataType;
}

export const isAthenticated = tryCatch(async(req: AuthenticatedRequest, res: Response, next: NextFunction)=>{

  const {token } = req.cookies;
  
  if (!token) {
    return next(
      new ErrorHandler("user is not authorized and authenticated", 401)
    );
  }
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const decode = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
  console.log(decode);
  
  const user = await User.findById(decode.id);
  if (!user) {
    return next(new ErrorHandler("Authenticated User not found", 404));
  }
  req.user = user;
  if (!req.user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Move to the next middleware or route handler
  next();
  


  })
