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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserPassword = exports.updateUser = exports.showCurrentUser = exports.getSingleUser = exports.getAllUsers = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const createTokenUser = (user) => ({
    name: user.name,
    userId: user._id,
    role: user.role,
});
const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin")
        return;
    if (requestUser._id && requestUser._id.toString() === resourceUserId)
        return;
    throw new errors_1.UnauthorizedError("Not authorized to access this route");
};
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    const users = yield User_1.default.find({ role: "user" }).select("-password");
    res.status(http_status_codes_1.StatusCodes.OK).json({ users });
});
exports.getAllUsers = getAllUsers;
const getSingleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.findOne({ _id: req.params.id }).select("-password");
    if (!user) {
        throw new errors_1.NotFoundError(`No user with id : ${req.params.id}`);
    }
    if (!req.user) {
        // Handle the case where req.user is undefined
        throw new errors_1.UnauthorizedError("User not authenticated");
    }
    // Convert ObjectId to string
    const resourceUserId = user._id.toString();
    checkPermissions(req.user, resourceUserId);
    res.status(http_status_codes_1.StatusCodes.OK).json({ user });
});
exports.getSingleUser = getSingleUser;
const showCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(http_status_codes_1.StatusCodes.OK).json({ user: req.user });
});
exports.showCurrentUser = showCurrentUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { email, name } = req.body;
    if (!email || !name) {
        throw new errors_1.BadRequestError("Please provide all values");
    }
    const user = yield User_1.default.findOneAndUpdate({ _id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id }, { email, name }, { new: true, runValidators: true });
    // Check if user is found
    if (!user) {
        throw new errors_1.NotFoundError(`No user found with id : ${(_b = req.user) === null || _b === void 0 ? void 0 : _b._id}`);
    }
    const tokenUser = createTokenUser(user);
    (0, jwt_1.attachCookiesToResponse)({ res, user: tokenUser });
    res.status(http_status_codes_1.StatusCodes.OK).json({ user: tokenUser });
});
exports.updateUser = updateUser;
const updateUserPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
        throw new errors_1.BadRequestError("Please provide both values");
    }
    console.log(req.user);
    const user = yield User_1.default.findOne({ _id: (_c = req.user) === null || _c === void 0 ? void 0 : _c._id });
    // Check if user is found
    if (!user) {
        throw new errors_1.NotFoundError(`No user found with id : ${(_d = req.user) === null || _d === void 0 ? void 0 : _d._id}`);
    }
    const isPasswordCorrect = yield user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new errors_1.UnauthenticatedError("Invalid Credentials");
    }
    user.password = newPassword;
    yield user.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Success! Password Updated." });
});
exports.updateUserPassword = updateUserPassword;
