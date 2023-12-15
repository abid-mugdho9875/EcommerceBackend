import { UnauthorizedError } from "../errors";

import mongoose from "mongoose";

const checkPermissions = (
  requestUser: { role: string; _id: mongoose.Types.ObjectId },
  resourceUserId: string
): void => {
  if (requestUser.role === "admin") return;
  if (requestUser._id.toString() === resourceUserId) return;
  throw new UnauthorizedError("Not authorized to access this route");
};
