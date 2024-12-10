import mongoose from "mongoose";
const schema = new mongoose.Schema({
    coupon: {
        type: String,
        required: [true, "please enter a coupon"],
        trim: true,
        unique: true
    },
    amount: {
        type: Number,
        required: [true, "Please enter a discount amount"],
    },
});
export const Coupon = mongoose.model("Coupon", schema);
