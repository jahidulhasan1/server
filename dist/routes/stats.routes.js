import express from "express";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.controllers.js";
import { adminOnly, isAthenticated } from "../middleware/auth.js";
const app = express.Router();
app.get("/stats", getDashboardStats);
app.get("/pie", isAthenticated, adminOnly, getPieCharts);
app.get("/bar", isAthenticated, adminOnly, getBarCharts);
app.get("/line", isAthenticated, adminOnly, getLineCharts);
export default app;
