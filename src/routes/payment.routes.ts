import express from "express";
import {
  createPaymentIntent,
  deleteDiscount,
  getAllCoupon,
  getDiscount,
  newCoupon,
} from "../controllers/payment.controllers.js";
import { adminOnly, isAthenticated } from "../middleware/auth.js";

const app = express.Router();

app.post("/create", createPaymentIntent);
app.post("/coupon/new",isAthenticated, adminOnly, newCoupon);

app.get("/discount", getDiscount);

app.get("/coupon/all",isAthenticated, adminOnly, getAllCoupon);

app.delete("/coupon/:id", isAthenticated,adminOnly, deleteDiscount);

export default app;
