// Import the Product and User models correctly

import mongoose, { Document, Schema } from "mongoose";
import { ProductModel } from "./Product"; // Assuming ProductModel is the exported model
import { IUser } from "./User"; // Assuming UserModel is the exported model

interface SingleOrderItem {
  name: string;
  image: string;
  price: number;
  amount: number;
  product: mongoose.Types.ObjectId | typeof ProductModel;
}

interface Order extends Document {
  tax: number;
  shippingFee: number;
  subtotal: number;
  total: number;
  orderItems: SingleOrderItem[];
  status: "pending" | "failed" | "paid" | "delivered" | "canceled";
  user: mongoose.Types.ObjectId | IUser;
  clientSecret: string;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SingleOrderItemSchema = new Schema<SingleOrderItem>({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  amount: { type: Number, required: true },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product", // Ensure that 'Product' here matches the name used in the 'Product' model
    required: true,
  },
});

const OrderSchema = new Schema<Order>(
  {
    tax: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    orderItems: [SingleOrderItemSchema],
    status: {
      type: String,
      enum: ["pending", "failed", "paid", "delivered", "canceled"],
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User", // Ensure that 'User' here matches the name used in the 'User' model
      required: true,
    },
    clientSecret: {
      type: String,
      required: true,
    },
    paymentIntentId: {
      type: String,
    },
  },
  { timestamps: true }
);

export const OrderModel = mongoose.model<Order>("Order", OrderSchema);
