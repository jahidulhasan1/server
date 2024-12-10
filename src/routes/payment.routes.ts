import express from "express";
import { deleteDiscount, getAllCoupon, getDiscount, newCoupon } from "../controllers/payment.controllers.js";
import { adminOnly } from "../middleware/auth.js";


const app = express.Router();

app.post("/coupon/new",adminOnly,newCoupon);

app.get("/discount",getDiscount);

app.get("/coupon/all",adminOnly,getAllCoupon);

app.delete("/coupon/:id",adminOnly,deleteDiscount)
 


export default app;
