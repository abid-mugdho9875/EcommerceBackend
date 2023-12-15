import { NextFunction, Request, Response } from "express";
import { UnauthenticatedError, UnauthorizedError } from "../errors";
import { JwtPayload, isTokenValid } from "../utils/jwt";

// Extend the Request interface to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    name: string;
    userId: string;
    role: string;
  };
}

const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new UnauthenticatedError("Authentication Invalid");
  }

  try {
    const result = isTokenValid({ token }) as JwtPayload;
    const { name, userId, role } = result;
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication Invalid");
  }
};

// Authorization for admin
const authorizePermissions = (...roles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    // Ensure req.user is defined before accessing its role property
    if (req.user && !roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

export { authenticateUser, authorizePermissions };
