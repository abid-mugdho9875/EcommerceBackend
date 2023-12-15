import mongoose, { Document, Model, Schema } from "mongoose";
import { IUser } from "./User";
interface Product extends Document {
  name: string;
  price: number;
  description: string;
  image: string;
  category: "office" | "kitchen" | "bedroom";
  company: "ikea" | "liddy" | "marcos";
  colors: string[];
  featured: boolean;
  freeShipping: boolean;
  inventory: number;
  averageRating: number;
  numOfReviews: number;
  user: mongoose.Types.ObjectId | IUser;
}

interface ProductModel extends Model<Product> {
  reviews: Array<Document>;
}

const ProductSchema = new Schema<Product>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: String, default: "/uploads/example.jpeg" },
    category: {
      type: String,
      enum: ["office", "kitchen", "bedroom"],
      required: true,
    },
    company: {
      type: String,
      enum: {
        values: ["ikea", "liddy", "marcos"],
        message: "{VALUE} is not supported",
      },
      required: true,
    },
    colors: { type: [String], default: ["#222"], required: true },
    featured: { type: Boolean, default: false },
    freeShipping: { type: Boolean, default: false },
    inventory: { type: Number, required: true, default: 15 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
  justOne: false,
});

ProductSchema.pre<Product>("deleteMany", async function (next) {
  await this.model("Review").deleteMany({ product: this._id });
  next();
});

export const ProductModel = mongoose.model<Product, ProductModel>(
  "Product",
  ProductSchema
);
