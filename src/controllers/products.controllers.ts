import { NextFunction, Response, Request } from "express";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { Product } from "../models/products.models.js";
import {
  newProductDataType,
  QueryType,
  searchRequestQuery,
} from "../types/types.js";

import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

// ! revalidate changes controllers & new order also
export const getLatestProduct = tryCatch(async (req, res, next) => {
  let product;

  if (myCache.has("latest")) {
    product = await JSON.parse(myCache.get("latest") as string);
  } else {
    product = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest", JSON.stringify(product));
  }

  // let product = await Product.find({}).sort({ createdAt: -1 }).limit(5);

  // const productFromCache = await invalidateCache(product, "latest");
  return res.json({
    success: true,
    products: product,
  });
});

// ! revalidate changes controllers & new order also
export const getAllCategories = tryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories")) {
    categories = await JSON.parse(myCache.get("categories") as string);
  } else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }
  return res.json({
    success: true,
    categories,
  });
});

// ! revalidate changes controllers & new order also
export const getAdminProducts = tryCatch(async (req, res, next) => {
  let product;

  if (myCache.has("admin-product")) {
    product = await JSON.parse(myCache.get("admin-product") as string);
  } else {
    product = await Product.find({});
    myCache.set("admin-product", JSON.stringify(product));
  }

  return res.json({
    success: true,
    products: product,
  });
});

export const getSingleProducts = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  let product;

  if (myCache.has(`single-product-${id}`)) {
    product = await JSON.parse(myCache.get(`single-product-${id}`) as string);
  } else {
    product = await Product.findById(id);
    myCache.set(`single-product-${id}`, JSON.stringify(product));
  }

  // product
  //key
  //

  return res.json({
    success: true,
    product,
  });
});

export const newProduct = tryCatch(
  async (
    req: Request<{}, {}, newProductDataType>,
    res: Response,
    next: NextFunction
  ) => {
    const { name, stock, price, category } = req.body;

    const photo = req.file;
    if (!photo) {
      return next(new ErrorHandler("photo required", 400));
    }

    if (!name || !stock || !price || !category) {
      rm(photo.path, () => {
        console.log("Photo deleted");
      });

      return next(new ErrorHandler("add empty failed", 400));
    }

    await Product.create({
      name,
      stock,
      price,
      category: category?.toLowerCase(),
      photo: photo?.path,
    });

    await invalidateCache({ product: true });

    return res.json({
      success: true,
      message: "product created successfully",
    });
  }
);

export const updateProduct = tryCatch(
  async (
    req: Request<{ id: string }, {}, newProductDataType>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;
    const { name, stock, price, category } = req.body; // as updated
    const photo = req.file;
    const product = await Product.findById(id);

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }
    if (photo) {
      rm(product.photo, () => {
        console.log("old photo deleted successfully");
      });
      product.photo = photo.path;
    }

    if (name) product.name = name;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (category) product.category = category;

    await product.save();
    await invalidateCache({ product: true, productId: String(product._id) });
    return res.json({
      success: true,
      message: "product updated successfully",
    });
  }
);

export const deleteProducts = tryCatch(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);

  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }

  rm(product.photo, () => {
    console.log("photo deleted successfully");
  });

  await Product.deleteOne();

  await invalidateCache({ product: true, productId: String(product._id) });
  return res.json({
    success: true,
    message: "product deleted successfully",
  });
});

export const getAllSearchProducts = tryCatch(
  async (
    req: Request<{ id: string }, {}, {}, searchRequestQuery>,
    res: Response,
    next: NextFunction
  ) => {
    const { category, price, search, sort } = req.query;
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;

    const skip = (page - 1) * limit;

    let baseQuery: QueryType = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromised = Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const filteredProductsPromised = Product.find(baseQuery);

    const [products, filteredProducts] = await Promise.all([
      productsPromised,
      filteredProductsPromised,
    ]);

    const totalPage = Math.ceil(filteredProducts.length / limit);
    return res.json({
      success: true,
      products,
      totalPage,
    });
  }
);
