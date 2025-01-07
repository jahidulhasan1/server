import express from "express";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder, } from "../controllers/orders.controllers.js";
import { adminOnly, isAthenticated } from "../middleware/auth.js";
const app = express.Router();
app.post("/new", newOrder);
app.get("/me", myOrders);
app.get("/allorders", allOrders);
app.route("/:id").get(getSingleOrder).put(isAthenticated, adminOnly, processOrder).delete(isAthenticated, adminOnly, deleteOrder);
export default app;
