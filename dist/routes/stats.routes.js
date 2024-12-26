import express from "express";
import { getBarCharts, getDashboardStats, getLineCharts, getPieCharts } from "../controllers/stats.controllers.js";
const app = express.Router();
app.get("/stats", getDashboardStats);
app.get("/pie", getPieCharts);
app.get("/bar", getBarCharts);
app.get("/line", getLineCharts);
export default app;
