import express from "express";
<<<<<<< HEAD
import userRoutes from "./routes/user.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import productsRoutes from "./routes/products.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { connectDB } from "./utils/connectdb.utils.js";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middleware/errorMiddleware.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
config({
    path: ".env",
});
connectDB(process.env.MONGOURI);
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
// middlewares
// appy
// .use();
app.use("/uploads", express.static("uploads"));
//! middlewares
app.use(errorMiddleware);
app.listen(process.env.PORT, () => {
    console.log(`server work ${process.env.PORT}`);
=======
const app = express();
app.listen("3000", () => {
    console.log("Server is running on port 5000"); // Start the server on port 5000
>>>>>>> e96c7b35ec48a0d15a87ddcaac069ef90fe472a0
});
