import { User } from "../models/user.models.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { tryCatch } from "./errorMiddleware.js";



export const adminOnly = tryCatch(async(req,res,next)=>{
  
   const  {id}= req.query;
   if (!id) return next(new ErrorHandler("signin First ", 401));

  const user = await User.findById(id);
  if (!user) return next(new ErrorHandler("Invalid Id", 401));


  if (user.role !== "admin")
   return next(new ErrorHandler("You can not access ", 403));

 next();


})