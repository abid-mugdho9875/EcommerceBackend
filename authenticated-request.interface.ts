import { Request } from "express";
import { IUser } from "./models/User"; // Adjust the import based on your actual user model

interface AuthenticatedRequest extends Request {
  user?: IUser; // Make user property optional
}

export { AuthenticatedRequest };
