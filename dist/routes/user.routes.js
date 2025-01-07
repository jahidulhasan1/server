import express from "express";
import { deleteUser, getAllUser, getSingleUser, login, logout, newUser, } from "../controllers/user.controllers.js";
import { adminOnly, isAthenticated } from "../middleware/auth.js";
import { singleUserProfUpload } from "../middleware/multer.js";
const app = express.Router();
app.post("/new", singleUserProfUpload, newUser);
app.post("/login", login);
app.post("/logout", isAthenticated, logout);
app.get("/getall", isAthenticated, adminOnly, getAllUser);
app
    .route("/:id")
    .get(getSingleUser)
    .delete(isAthenticated, adminOnly, deleteUser);
export default app;
