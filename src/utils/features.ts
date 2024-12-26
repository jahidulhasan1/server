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

export const calculatePercentage = (currMonth: number, lastMonth: number) => {
  if (lastMonth === 0) return 100 * lastMonth;

  const percentage = (currMonth - lastMonth) * 100;
  return Number(percentage.toFixed(0));
};

export const getCategory = async ({
  categories,
  productsCount,
}: {
  categories: string[];
  productsCount: number;
}) => {
  console.log(categories, productsCount);

  let categoriesCount: Record<string, number>[] = [];

  const categoryCountsPromise = categories?.map((category) =>
    Product.countDocuments({ category })
  );

  const categoryCounts = await Promise.all(categoryCountsPromise);

  categories?.forEach((category, i) => {
    categoriesCount?.push({
      [category]: Math.round((categoryCounts[i] / productsCount) * 100),
    });
  });
  return categoriesCount;
};

type chartDataProps = {
  length: number;
  docArr: (Document & { createdAt: Date })[];

 
};

export const getChartData = ({ length, docArr }: chartDataProps) => {
  const data: number[] = new Array(length).fill(0);
  const today = new Date();
  //  const lastSixMonthsOrder =lastSixMonthOrders.length
  docArr.forEach((i) => {
    const creationDate = i.createdAt;
    const monthsDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;
    if (monthsDiff < length) {
      data[length - monthsDiff - 1] += 1;
    }
  });
  return data;
};
