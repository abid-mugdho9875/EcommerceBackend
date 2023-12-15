import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../errors";
import { ProductModel as Product } from "../models/Product";
import Review from "../models/Review";
import { IUser } from "../models/User";
// Extend the Request interface to include the user property
interface CustomRequest<T = any> extends Request {
  user?: IUser; // Adjust the type based on your actual user type or model
  _id: string;
}
const checkPermissions = (
  requestUser: { role: string; _id: mongoose.Types.ObjectId },
  resourceUserId: string
): void => {
  if (requestUser.role === "admin") return;
  if (requestUser._id.toString() === resourceUserId) return;
  throw new UnauthorizedError("Not authorized to access this route");
};

const createReview = async (req: CustomRequest, res: Response) => {
  const { product: productId } = req.body;
  const isValidProduct = await Product.findOne({ _id: productId });

  if (!isValidProduct) {
    throw new NotFoundError(`No product with id : ${productId}`);
  }

  const alreadySubmitted = await Review.findOne({
    product: productId,
    user: req.user?._id,
  });

  if (alreadySubmitted) {
    throw new BadRequestError("Already submitted review for this product");
  }

  req.body.user = req.user?._id;
  const review = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review });
};

const getAllReviews = async (req: CustomRequest, res: Response) => {
  const reviews = await Review.find({})
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });

  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

const getSingleReview = async (req: CustomRequest, res: Response) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId })
    .populate({
      path: "product",
      select: "name company price",
    })
    .populate({
      path: "user",
      select: "name",
    });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  res.status(StatusCodes.OK).json({ review });
};

const updateReview = async (req: CustomRequest, res: Response) => {
  const { id: reviewId } = req.params;
  const { rating, title, comment } = req.body;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  if (!req.user) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Assuming req.user._id is a string
  const userIdString: string = req.user?._id?.toString() || "";

  // Convert the string to ObjectId
  const userIdObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    userIdString
  );
  checkPermissions(
    { role: req.user?.role, _id: userIdObjectId },
    review.user?.toString() || ""
  );

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();
  res.status(StatusCodes.OK).json({ review });
};

const deleteReview = async (req: CustomRequest, res: Response) => {
  const { id: reviewId } = req.params;

  const review = await Review.findOne({ _id: reviewId });

  if (!review) {
    throw new NotFoundError(`No review with id ${reviewId}`);
  }

  // Assuming req.user._id is a string
  const userIdString: string = req.user?._id?.toString() ?? "";

  // Convert the string to ObjectId
  const userIdObjectId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId(
    userIdString
  );
  checkPermissions(
    { role: req.user!.role, _id: userIdObjectId },
    review.user!.toString() || ""
  );
  await review.deleteOne();

  res.status(StatusCodes.OK).json({ msg: "Success! Review removed" });
};

const getSingleProductReviews = async (req: Request, res: Response) => {
  const { id: productId } = req.params;
  const reviews = await Review.find({ product: productId });
  res.status(StatusCodes.OK).json({ reviews, count: reviews.length });
};

export {
  createReview,
  deleteReview,
  getAllReviews,
  getSingleProductReviews,
  getSingleReview,
  updateReview,
};
