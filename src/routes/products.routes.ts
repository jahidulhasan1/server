import express from "express";
import {
  deleteProducts,
  getAdminProducts,
  getAllCategories,
  getLatestProduct,
  getSingleProducts,
  newProduct,
  updateProduct,
} from "../controllers/products.controllers.js";
import { adminOnly } from "./../middleware/auth.js";
import { singleUpload } from "../middleware/multer.js";
import { singleUpload } from "./../../dist/middleware/multer";

const app = express.Router();

app.post("/new", singleUpload, newProduct);

app.get("/latest", getLatestProduct);
app.get("/categories", getAllCategories);

app.get("/adminproduct", adminOnly, getAdminProducts);

app
  .route("/:id")
  .get(getSingleProducts)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProducts);
app.get("/latest", getLatestProduct);
export default app;
