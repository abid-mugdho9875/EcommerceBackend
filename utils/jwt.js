"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenValid = exports.createJWT = exports.attachCookiesToResponse = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Function to create a JWT token
const createJWT = ({ payload }) => {
    // Sign the payload with the JWT secret and set expiration time
    const token = jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFE,
    });
    return token;
};
exports.createJWT = createJWT;
// Function to attach JWT token as a cookie to the response
const attachCookiesToResponse = ({ res, user, }) => {
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
exports.attachCookiesToResponse = attachCookiesToResponse;
// Function to check the validity of a JWT token
const isTokenValid = ({ token }) => {
    try {
        // Verify the token and return the decoded payload
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        // Handle token verification errors (e.g., token expired)
        throw new Error("Invalid token");
    }
};
exports.isTokenValid = isTokenValid;
