import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors";
import { IUser } from "../models/User";

import { ProductModel as Product } from "../models/Product";

import Review from "../models/Review";

// Extend the Request interface to include the user property
interface CustomRequest<T = any> extends Request {
  user?: IUser; // Adjust the type based on your actual user type or model
  _id: string;
}

const createProduct = async (req: CustomRequest, res: Response) => {
  req.body.user = req.user?._id;
  console.log(req.body.user);
  console.log(req.user?._id);
  const product = await Product.create(req.body as typeof Product);
  res.status(StatusCodes.CREATED).json({ product });
};

const getAllProducts = async (req: CustomRequest, res: Response) => {
  const products = await Product.find({}).populate("reviews");

  res.status(StatusCodes.OK).json({ products, count: products.length });
};

const getSingleProduct = async (req: CustomRequest, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId }).populate("reviews");

  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const updateProduct = async (req: CustomRequest, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOneAndUpdate({ _id: productId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  res.status(StatusCodes.OK).json({ product });
};

const deleteProduct = async (req: CustomRequest, res: Response) => {
  const { id: productId } = req.params;

  const product = await Product.findOne({ _id: productId });

  if (!product) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  await product.deleteOne();
  await Review.deleteMany({ product: productId });
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed." });
};

// const uploadImage = async (req: CustomRequest, res: Response) => {
//   if (!req.files) {
//     throw new BadRequestError('No File Uploaded');
//   }
//   const productImage = req.files.image as Express.Multer.File;

//   if (!productImage.mimetype.startsWith('image')) {
//     throw new BadRequestError('Please Upload Image');
//   }

//   const maxSize = 1024 * 1024;

//   if (productImage.size > maxSize) {
//     throw new BadRequestError(
//       'Please upload image smaller than 1MB'
//     );
//   }

//   const imagePath = path.join(
//     __dirname,
//     '../public/uploads/' + `${productImage.name}`
//   );
//   await productImage.mv(imagePath);
//   res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
// };

export {
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
};
