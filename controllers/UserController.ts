import { Response } from "express";
import { StatusCodes } from "http-status-codes";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../authenticated-request.interface";
import {
  BadRequestError,
  NotFoundError,
  UnauthenticatedError,
  UnauthorizedError,
} from "../errors";
import User, { IUser } from "../models/User";
import { attachCookiesToResponse } from "../utils/jwt";

const createTokenUser = (user: IUser) => ({
  name: user.name,
  userId: user._id,
  role: user.role,
});

const checkPermissions = (
  requestUser: { role: string; _id?: mongoose.Types.ObjectId },
  resourceUserId: string
): void => {
  if (requestUser.role === "admin") return;
  if (requestUser._id && requestUser._id.toString() === resourceUserId) return;
  throw new UnauthorizedError("Not authorized to access this route");
};

const getAllUsers = async (req: AuthenticatedRequest, res: Response) => {
  console.log(req.user);
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req: AuthenticatedRequest, res: Response) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
  if (!user) {
    throw new NotFoundError(`No user with id : ${req.params.id}`);
  }

  if (!req.user) {
    // Handle the case where req.user is undefined
    throw new UnauthorizedError("User not authenticated");
  }

  // Convert ObjectId to string
  const resourceUserId = user._id.toString();

  checkPermissions(req.user, resourceUserId);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOneAndUpdate(
    { _id: req.user?._id },
    { email, name },
    { new: true, runValidators: true }
  );

  // Check if user is found
  if (!user) {
    throw new NotFoundError(`No user found with id : ${req.user?._id}`);
  }

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req: AuthenticatedRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError("Please provide both values");
  }

  console.log(req.user);

  const user = await User.findOne({ _id: req.user?._id });

  // Check if user is found
  if (!user) {
    throw new NotFoundError(`No user found with id : ${req.user?._id}`);
  }

  const isPasswordCorrect = await user.comparePassword(oldPassword);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  user.password = newPassword;

  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! Password Updated." });
};

export {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
