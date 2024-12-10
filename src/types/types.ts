import { NextFunction, Request, Response } from "express";
import { clearScreenDown } from "readline";

export type newUserDataType = {
  name: string;
  email: string;
  photo: string;
  dob: Date;
  gender: string;
  _id: string;
};

export type newProductDataType = {
  name: string;
  price: number;
  photo: string;
  stock: number;
  category: string;
};
export type userController = (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export type searchRequestQuery = {
  search?: string;
  price?: number;
  category?: string;
  sort?: string;
  page?: number;
};

export interface QueryType {
  name?: {
    $regex: string;
    $options?: string;
  };
  sort?: string;
  price?: {
    $lte: number;
  };
  category?: string;
}

export interface invalitadeProps {
  product: boolean;
  order: boolean;
  admin: boolean;
  userId: string;
  orderId: string;
  productId: string | string[];
}

export type orderItemsType = {
  name: string;
  photo: string;
  price: number;
  quantity: number;
  productId: string;
};
export type shippingInfoType = {
  address: string;
  city: string;
  state: string;
  pinCode: number;
  country: string;
};
export interface newOrderRequestBody {
  shippingInfo: shippingInfoType;
  user: string;
  subtotal: number;
  tax: number;
  shippingCharges: number;
  discount: number;
  total: number;
  status: string;
  orderItems: orderItemsType[];
}
