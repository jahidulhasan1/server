import express from "express";
import { deleteProducts, getAdminProducts, getAllCategories, getLatestProduct, getSingleProducts, newProduct, updateProduct, } from "../controllers/products.controllers.js";
import { adminOnly } from "./../middleware/auth.js";
import { ProductPhotoUpload } from "../middleware/multer.js";
const app = express.Router();
app.post("/new", ProductPhotoUpload, newProduct);
app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);
app.get("/adminproduct", adminOnly, getAdminProducts);
app
    .route("/:id")
    .get(getSingleProducts)
    .put(adminOnly, ProductPhotoUpload, updateProduct)
    .delete(adminOnly, deleteProducts);
app.get("/latest", getLatestProduct);
export default app;
