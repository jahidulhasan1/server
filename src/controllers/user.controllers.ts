import { NextFunction, Request, Response } from "express";
import { User } from "../models/user.models.js";
import { newUserDataType } from "../types/types.js";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { rm } from "fs";
import { uploadUserProfile } from "../utils/features.js";

// export const newUser = tryCatch(
//   async (
//     req: Request<{}, {}, newUserDataType>,
//     res: Response,
//     next: NextFunction
//   ) => {
//     const { name, email, dob, gender, password } = req.body;
//     const photo = req.file;
//     if (!photo) {
//       return next(new ErrorHandler("photo required", 400));
//     }

//     if (!name || !email || !gender || !dob || !password) {
//       rm(photo.path, () => {
//         console.log("Photo deleted");
//       });

//       return next(new ErrorHandler("add empty failed", 400));
//     }

//     if (!name || !email || !photo || !dob  || !gender || !password)
//       next(new ErrorHandler("add all required felids ", 400));

//     let user = await User.findOne({email});

//     if (user){
//       rm(photo.path, () => {
//         console.log("Photo deleted");
//       });
//       return res.status(400).json({
//         success: false,
//         message: "this Email has taken,Try new Email",
//       });}
//       console.log(req.file);

//       console.log(photo);

// console.log(photo.path);

// const profilePhotoUrl = await uploadUserProfile(photo.path);
//     console.log(profilePhotoUrl);

//     await User.create({

//       name,
//       email,
//       password,
//       photo: profilePhotoUrl,
//       role: "user",
//       gender,
//       dob: new Date(dob),
//     });

//     return res.status(201).json({
//       success: true,
//       message: "User created successfully",
//     });
//   }
// );

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
      return res.status(400).json({
        success: false,
        message: "This email is already taken. Try a new email.",
      });
    }

    try {
      // Upload the user profile photo to Cloudinary
      const profilePhotoUrl = await uploadUserProfile(photo.path);

      // Create a new user
      await User.create({
        name,
        email,
        password,
        photo: profilePhotoUrl,
        role: "user",
        gender,
        dob: new Date(dob),
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
      });
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
