import { NextFunction, Request, Response } from "express";
import { tryCatch } from "../middleware/errorMiddleware.js";
import { newOrderRequestBody, orderItemsType } from "../types/types.js";
import { Order } from "../models/orders.schema.js";
import { decreaseStock, invalidateCache } from "../utils/features.js";
import { ErrorHandler } from "../utils/utils.class.js";
import { myCache } from "../app.js";

export const myOrders = tryCatch(async (req, res, next) => {
  const { id: user } = req.query;
  let orders = [];
  if (myCache.has(`my-orders-${user}`)) {
    orders = JSON.parse(myCache.get(`my-orders-${user}`) as string);
  } else {
    orders = await Order.find({ user });
    myCache.set(`my-orders-${user}`, JSON.stringify(orders));
  }

  return res.status(200).json({
    success: true,
    orders,
  });
});

// !admin
export const allOrders = tryCatch(async (req, res, next) => {
  let orders = [];
  if (myCache.has(`my-all-orders`)) {
    orders = JSON.parse(myCache.get(`my-all-orders`) as string);
  } else {
    orders = await Order.find().populate("user", "name");
    myCache.set(`my-all-orders`, JSON.stringify(orders));
  }
  console.log(orders);

  return res.status(200).json({
    success: true,
    orders,
  });
});

export const getSingleOrder = tryCatch(async (req, res, next) => {
  const { id } = req.params;

  let order;
  if (myCache.has(`order-${id}`)) {
    order = JSON.parse(myCache.get(`order-${id}`) as string);
  } else {
    order = await Order.findById(id).populate("user", "name");
    if (!order) return next(new Error(`Order not found`));
    myCache.set(`order-${id}`, JSON.stringify(order));
  }
  console.log(order);

  return res.status(200).json({
    success: true,
    order,
  });
});

export const newOrder = tryCatch(
  async (
    req: Request<{}, {}, newOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const {
      shippingInfo,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
      status,
      orderItems,
    } = req.body;

    // Validate required fields
    if (!shippingInfo || !tax || !total || !user || !subtotal || !orderItems) {
      return next(new ErrorHandler("Fill the required fields", 400));
    }

    // First, decrease stock for the ordered items
    await decreaseStock(orderItems); // This will throw an error if there's an issue

    // Create new order if stock adjustment is successful
    const order = await Order.create({
      shippingInfo,
      user,
      subtotal,
      tax,
      shippingCharges,
      discount,
      total,
      status,
      orderItems,
    });

    // Invalidate cache after order creation
    // const prodId
    await invalidateCache({
      product: true,
      order: true,
      admin: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId)),
    });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Order placed successfully",
      order, // Optionally return the created order
    });
  }
);

export const processOrder = tryCatch(
  async (
    req: Request<{ id: string }, {}, newOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) return next(new ErrorHandler("Order not found", 404));

    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
    await order.save();
    // Invalidate cache after order creation
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user.toString(),
      orderId: String(order._id),
    });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Order processed successfully",
      order, // Optionally return the created order
    });
  }
);

export const deleteOrder = tryCatch(
  async (
    req: Request<{ id: string }, {}, newOrderRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order not found", 404));

    await order.deleteOne();
    // Invalidate cache after order creation
    await invalidateCache({
      product: false,
      order: true,
      admin: true,
      userId: order.user.toString(),
      orderId: String(order._id),
    });

    // Respond with success message
    return res.status(200).json({
      success: true,
      message: "Order deleted successfully",
      order, // Optionally return the created order
    });
  }
);
