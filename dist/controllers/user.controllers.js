import { User } from "../models/user.models.js";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { ErrorHandler } from "../utils/utils.class.js";
export const newUser = tryCatch(async (req, res, next) => {
    const { name, email, photo, dob, gender, _id } = req.body;
    if (!name || !email || !photo || !dob || !_id)
        next(new ErrorHandler("add all required felids ", 400));
    let user = await User.findById(_id);
    let userEmail = await User.findById(_id).select("email");
    if (user)
        res.status(200).json({
            success: true,
            message: "User already exists",
        });
    if (userEmail)
        res.status(200).json({
            success: true,
            message: "this Email has taken,Try new Email",
        });
    await User.create({
        name,
        email,
        photo,
        dob: new Date(dob),
        gender,
        _id,
    });
    return res.status(201).json({
        success: true,
        message: "User created successfully",
    });
});
export const getAllUser = tryCatch(async (req, res, next) => {
    const users = await User.find({});
    return res.status(200).json({
        success: true,
        users,
    });
});
export const getSingleUser = tryCatch(async (req, res, next) => {
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
});
export const deleteUser = tryCatch(async (req, res, next) => {
    const id = req.params.id;
    const user = await User.findById(id);
    if (!user)
        return next(new ErrorHandler("Invalid Id", 400));
    await User.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User Deleted Successfully",
    });
});
