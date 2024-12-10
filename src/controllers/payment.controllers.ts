import { tryCatch } from "../middleware/errorMiddleware.js";
import { Coupon } from "../models/cupon.schema.js";
import { ErrorHandler } from "../utils/utils.class.js";

export const newCoupon = tryCatch(async (req, res, next) => {
  const { coupon, amount } = req.body;

  if (!coupon || !amount) return next(new ErrorHandler("enter feilds", 400));

  await Coupon.create({
    coupon,
    amount,
  });

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully",
  });
});

export const getDiscount = tryCatch(async (req, res, next) => {
  const { coupon } = req.query;

  const discount = await Coupon.findOne({ coupon: coupon });
  if (!discount) return next(new ErrorHandler("Invalid coupon", 400));

  return res.status(200).json({
    success: true,
    discount: discount.amount,
  });
});

export const getAllCoupon = tryCatch(async (req, res, next) => {
  const coupons = await Coupon.find({});

  return res.status(200).json({
    success: true,
    coupons,
  });
});

export const deleteDiscount = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await Coupon.findById(id);

  if (!coupon) {
    return next(new ErrorHandler("Product not found", 404));
  }

  await Coupon.deleteOne();

  return res.status(200).json({
    success: true,
    message: "coupon deleted successfully",
  });
});
