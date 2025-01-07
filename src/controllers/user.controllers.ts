import { NextFunction, Request, Response } from "express";
import { User, UserModel } from "../models/user.models.js";
import { newUserDataType, loggedUserData } from "../types/types.js";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { rm } from "fs";
import { uploadUserProfile } from "../utils/features.js";
import { sendToken } from "../utils/sendToken.js";

export const login = tryCatch(
  async (
    req: Request<{}, {}, loggedUserData>,
    res: Response,
    next: NextFunction
  ) => {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return next(new ErrorHandler("All fields are required", 400));
    }

    // Find the user by email
    const user = (await User.findOne({ email })) as UserModel;

    // Check if user exists
    if (!user) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Compare the entered password with the stored password
    const isMatch = await user.comparePass(password, user.password);
    if (!isMatch) {
      return next(new ErrorHandler("Invalid credentials", 401));
    }

    // Send token and respond to the client
    sendToken(user, res, 200, "Logged in successfully");
  }
);
export const logout = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()), // Expire the cookie immediately
      httpOnly: true,
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const newUser = tryCatch(
  async (
    req: Request<{}, {}, newUserDataType>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, email, dob, gender, password } = req.body;
    const photo = req.file;

    // Check if photo is provided
    if (!photo) {
      return next(new ErrorHandler("Photo required", 400));
    }

    // Check for required fields
    if (!name || !email || !gender || !dob || !password) {
      rm(photo.path, () => {
        console.log("Photo deleted due to missing fields");
      });
      return next(new ErrorHandler("All fields are required", 400));
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      rm(photo.path, () => {
        console.log("Photo deleted due to existing user");
      });
      return next(
        new ErrorHandler("This email is already taken. Try a new email.", 400)
      );
    }

    try {
      // Upload the user profile photo to Cloudinary
      const profilePhotoUrl = await uploadUserProfile(photo.path);

      // Create a new user
      const user: UserModel = await User.create({
        name,
        email,
        password,
        photo: profilePhotoUrl,
        role: "user",
        gender,
        dob: new Date(dob),
      });

      // return res.status(200).json({
      //   success: true,
      //   message: "User created successfully",
      // });
      sendToken(user, res, 200, "Registered successfully");
    } catch (error) {
      // Handle any error during upload or user creation
      console.error("Error occurred:", error);
      rm(photo.path, () => {
        console.log("Photo deleted due to error during user creation");
      });
      return next(new ErrorHandler("User creation failed", 500));
    }
  }
);

export const getAllUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({});
    return res.status(200).json({
      success: true,
      users,
    });
  }
);

export const getSingleUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    console.log(id);

    const user = await User.findById(id);
    if (!user) {
      return next(new ErrorHandler("User not found", 404)); // Handle user not found
    }
    return res.status(200).json({
      success: true,
      user,
    });
  }
);

export const deleteUser = tryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) return next(new ErrorHandler("Invalid Id", 400));

    await User.deleteOne();

    return res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  }
);
