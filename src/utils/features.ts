import { myCache } from "../app.js";
import { Order } from "../models/orders.schema.js";

import { invalitadeProps, orderItemsType } from "../types/types.js";
import { Product } from "./../models/products.models.js";
import { ErrorHandler } from "./utils.class.js";
type ProductDataT = Array<any> | { [key: string]: any };
// export const invalidateCache = async (
//   data: object,
//   key: string
// ): Promise<Object> => {
//   console.log(typeof data);
//   console.log(data);
//   let product;

//   if (myCache.has(key)) {
//     product = await JSON.parse(myCache.get(key) as string);
//   } else {
//     product = data;
//     myCache.set(key, JSON.stringify(product));
//   }

//   return product;
// };

export const invalidateCache = async ({
  product,
  order,
  admin,
  userId,
  orderId,
  productId,
}: Partial<invalitadeProps>) => {
  if (product) {
    const productKeys: string[] = [
      "latest",
      "categories",
      "admin-product",
      //all-products
    ];
    if (typeof productId === "string") {
      productKeys.push(` single-product-${productId}`);
    }

    //  in js array also object
    if (typeof productId === "object") {
      productId.map((i) => productKeys.push(` single-product-${i}`));
    }
   

    myCache.del(productKeys);
  }

  if (order) {
    const ordersKeys: string[] = [
      "my-all-orders",
      `my-orders-${userId}`,
      `order-${orderId}`,
    ];
    const orders = await Order.find({}).select("_id");

    myCache.del(ordersKeys);
  }
};

export const decreaseStock = async (orderItem: orderItemsType[]) => {
  for (let i = 0; i < orderItem?.length; i++) {
    const orderedItem = orderItem[i];

    const product = await Product.findById(orderedItem.productId);

    if (!product) throw new Error("Product not found");

    if (product.stock <= 0) {
      throw new Error("Out of stock");
    }

    if (orderedItem.quantity > product.stock) {
      throw new Error(
        `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${orderedItem.quantity}`
      );
    }

    product.stock -= orderedItem.quantity;

    await product.save();
  }
};
