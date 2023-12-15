import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";
import { OrderModel as Order } from "../models/Order";
import { ProductModel as Product } from "../models/Product";
import { IUser } from "../models/User";

interface CartItem {
  product: string;
  amount: number;
}

interface OrderItem {
  amount: number;
  name: string;
  price: number;
  image: string;
  product: string;
}

// Extend the Request interface to include the user property
interface CustomRequest<T = any> extends Request {
  user?: IUser; // Adjust the type based on your actual user type or model
  _id: string;
}

interface FakeStripeAPIResponse {
  client_secret: string;
  amount: number;
}

const fakeStripeAPI = async ({
  amount,
  currency,
}: {
  amount: number;
  currency: string;
}): Promise<FakeStripeAPIResponse> => {
  const client_secret = "someRandomValue";
  return { client_secret, amount };
};

const checkPermissions = (
  requestUser: { role: string; _id: mongoose.Types.ObjectId },
  resourceUserId: string
): void => {
  if (requestUser.role === "admin") return;
  if (requestUser._id.toString() === resourceUserId) return;
  throw new UnauthorizedError("Not authorized to access this route");
};

const createOrder = async (req: CustomRequest, res: Response) => {
  const { items: cartItems, tax, shippingFee } = req.body;

  if (!cartItems || cartItems.length < 1) {
    throw new BadRequestError("No cart items provided");
  }
  if (!tax || !shippingFee) {
    throw new BadRequestError("Please provide tax and shipping fee");
  }

  let orderItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of cartItems as CartItem[]) {
    const dbProduct = await Product.findOne({ _id: item.product });
    if (!dbProduct) {
      throw new NotFoundError(`No product with id : ${item.product}`);
    }
    const { name, price, image, _id } = dbProduct;
    const singleOrderItem: OrderItem = {
      amount: item.amount,
      name,
      price,
      image,
      product: _id,
    };
    orderItems = [...orderItems, singleOrderItem];
    subtotal += item.amount * price;
  }

  const total = shippingFee + tax + subtotal;
  const paymentIntent = await fakeStripeAPI({
    amount: total,
    currency: "usd",
  });

  const order = await Order.create({
    orderItems,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user?._id?.toString() || "",
  });

  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const getAllOrders = async (req: CustomRequest, res: Response) => {
  const orders = await Order.find({});
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const getSingleOrder = async (req: CustomRequest, res: Response) => {
  const { id: orderId } = req.params;
  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  if (req.user) {
    // Assuming req.user is of type IUser or similar
    checkPermissions(
      { role: req.user.role, _id: req.user._id },
      order.user?.toString() || ""
    );
  }
  res.status(StatusCodes.OK).json({ order });
};

const getCurrentUserOrders = async (req: CustomRequest, res: Response) => {
  const orders = await Order.find({
    user: req.user?._id ? req.user._id.toString() : "",
  });
  res.status(StatusCodes.OK).json({ orders, count: orders.length });
};

const updateOrder = async (req: CustomRequest, res: Response) => {
  const { id: orderId } = req.params;
  const { paymentIntentId } = req.body;

  const order = await Order.findOne({ _id: orderId });
  if (!order) {
    throw new NotFoundError(`No order with id : ${orderId}`);
  }
  if (req.user) {
    console.log("req.user._id:", req.user?._id);
    console.log("order.user:", order.user);
    checkPermissions(
      { role: req.user.role, _id: req.user._id },
      order.user?.toString() || ""
    );
  }

  order.paymentIntentId = paymentIntentId;
  order.status = "paid";
  await order.save();

  res.status(StatusCodes.OK).json({ order });
};

export {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
};
