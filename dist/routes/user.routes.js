import express from "express";
import { deleteUser, getAllUser, getSingleUser, newUser } from "../controllers/user.controllers.js";
import { adminOnly } from "../middleware/auth.js";
const app = express.Router();
app.post("/new", newUser);
app.get("/getall", adminOnly, getAllUser);
app.route("/:id").get(getSingleUser).delete(adminOnly, deleteUser);
export default app;
