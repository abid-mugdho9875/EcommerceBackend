import { Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Define types for function arguments
interface CreateJWTArgs {
  payload: object;
}

interface AttachCookiesToResponseArgs {
  res: Response;
  user: object;
}

interface IsTokenValidArgs {
  token: string;
}

// Function to create a JWT token
const createJWT = ({ payload }: CreateJWTArgs): string => {
  // Sign the payload with the JWT secret and set expiration time
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_LIFE,
  });
  return token;
};

// Function to attach JWT token as a cookie to the response
const attachCookiesToResponse = ({
  res,
  user,
}: AttachCookiesToResponseArgs): void => {
  // Create a JWT token using the user payload
  const token = createJWT({ payload: user });

  // Set cookie options
  const oneDay = 1000 * 60 * 60 * 24;
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === "production", // Set secure flag in production
    signed: true,
  });
};

// Function to check the validity of a JWT token
const isTokenValid = ({ token }: IsTokenValidArgs): JwtPayload | string => {
  try {
    // Verify the token and return the decoded payload
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
  } catch (error) {
    // Handle token verification errors (e.g., token expired)

    throw new Error("Invalid token");
  }
};

// Export the functions for use in other modules
export { JwtPayload, attachCookiesToResponse, createJWT, isTokenValid };
