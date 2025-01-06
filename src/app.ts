import express, { NextFunction, Request, Response } from "express";
import userRoutes from "./routes/user.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import cors from "cors";
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
import { v2 as cloudinary } from 'cloudinary';
config({
  path: ".env",
});
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
connectDB(process.env.MONGOURI as string);
const PORT = process.env.PORT ?? 5005;
const clientURL = process.env.CLIENT_URL as string;
const app = express();

export const myCache = new NodeCache();
// middleware

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
// app.use(
//   cors({
//     origin: clientURL,
//     methods: ["GET", "HEAD", "POST", "PUT"],
//     credentials: true, // Corrected from "credential"
//   })
// );
app.options("*", cors()); // Allow all preflight requests
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("api working");
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


//!  cloudinary
  // Configuration
  cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret:  process.env.API_SECRET_KEY // Click 'View API Keys' above to copy your API secret
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
