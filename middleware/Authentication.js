"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermissions = exports.authenticateUser = void 0;
const errors_1 = require("../errors");
const jwt_1 = require("../utils/jwt");
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.signedCookies.token;
    if (!token) {
        throw new errors_1.UnauthenticatedError("Authentication Invalid");
    }
    try {
        const result = (0, jwt_1.isTokenValid)({ token });
        const { name, userId, role } = result;
        req.user = { name, userId, role };
        next();
    }
    catch (error) {
        throw new errors_1.UnauthenticatedError("Authentication Invalid");
    }
});
exports.authenticateUser = authenticateUser;
// Authorization for admin
const authorizePermissions = (...roles) => {
    return (req, res, next) => {
        // Ensure req.user is defined before accessing its role property
        if (req.user && !roles.includes(req.user.role)) {
            throw new errors_1.UnauthorizedError("Unauthorized to access this route");
        }
        next();
    };
};
exports.authorizePermissions = authorizePermissions;
