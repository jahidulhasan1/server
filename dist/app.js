import express from "express";
import userRoutes from "./routes/user.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import productsRoutes from "./routes/products.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import { connectDB } from "./utils/connectdb.utils.js";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
config({
    path: ".env",
});
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
connectDB(process.env.MONGOURI);
const PORT = process.env.PORT ?? 5005;
const app = express();
export const myCache = new NodeCache();
// middleware
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.get("/", (req, res, next) => {
    res.send("l");
});
// routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productsRoutes);
app.use("/api/v1/order", ordersRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/dashboard", statsRoutes);
// middlewares
// appy
// .use();
app.use("/uploads", express.static("uploads"));
//! middlewares
app.use(errorMiddleware);
app.listen(PORT, () => {
    console.log("Server is running on port 5000");
});
