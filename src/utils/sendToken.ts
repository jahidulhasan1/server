import jwt from "jsonwebtoken";
import { newUserDataType } from "../types/types.js";
import { Response } from "express";


export const sendToken = (
  user: newUserDataType,
  res: Response<any, Record<string, any>>,
  statusCode: number,
  message: string
) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }
  const generateToken = jwt.sign({ id: user._id ,role:user.role}, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_TIME,
  });

  const cookieExpireIn = process.env.JWT_COOKIE_EXPIRES_IN;
  if (!cookieExpireIn) {
    throw new Error("JWT_COOKIE_EXPIRES_IN is not defined");
  }

  const options: {
    expires: Date;
    httpOnly: boolean;
    sameSite: "strict" | "lax" | "none";
  } = {
    expires: new Date(
      Date.now() + Number(cookieExpireIn) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "strict",
  };

  user.password = undefined;
  res.status(statusCode).cookie("token", generateToken, options).json({
    success: true,
    message,
    user,
    generateToken,
  });
};
