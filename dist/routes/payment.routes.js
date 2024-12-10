import express from "express";
import { getAllDiscount, getDiscount, mewCoupon } from "../controllers/payment.controllers.js";
const app = express.Router();
app.post("/coupon/new", mewCoupon);
app.get("/discount", getDiscount);
app.get("/discount/all", getAllDiscount);
export default app;
