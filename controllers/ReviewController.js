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
exports.updateReview = exports.getSingleReview = exports.getSingleProductReviews = exports.getAllReviews = exports.deleteReview = exports.createReview = void 0;
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const errors_1 = require("../errors");
const Product_1 = require("../models/Product");
const Review_1 = __importDefault(require("../models/Review"));
const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin")
        return;
    if (requestUser._id.toString() === resourceUserId)
        return;
    throw new errors_1.UnauthorizedError("Not authorized to access this route");
};
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { product: productId } = req.body;
    const isValidProduct = yield Product_1.ProductModel.findOne({ _id: productId });
    if (!isValidProduct) {
        throw new errors_1.NotFoundError(`No product with id : ${productId}`);
    }
    const alreadySubmitted = yield Review_1.default.findOne({
        product: productId,
        user: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
    });
    if (alreadySubmitted) {
        throw new errors_1.BadRequestError("Already submitted review for this product");
    }
    req.body.user = (_b = req.user) === null || _b === void 0 ? void 0 : _b._id;
    const review = yield Review_1.default.create(req.body);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ review });
});
exports.createReview = createReview;
const getAllReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const reviews = yield Review_1.default.find({})
        .populate({
        path: "product",
        select: "name company price",
    })
        .populate({
        path: "user",
        select: "name",
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({ reviews, count: reviews.length });
});
exports.getAllReviews = getAllReviews;
const getSingleReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: reviewId } = req.params;
    const review = yield Review_1.default.findOne({ _id: reviewId })
        .populate({
        path: "product",
        select: "name company price",
    })
        .populate({
        path: "user",
        select: "name",
    });
    if (!review) {
        throw new errors_1.NotFoundError(`No review with id ${reviewId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ review });
});
exports.getSingleReview = getSingleReview;
const updateReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d, _e, _f;
    const { id: reviewId } = req.params;
    const { rating, title, comment } = req.body;
    const review = yield Review_1.default.findOne({ _id: reviewId });
    if (!review) {
        throw new errors_1.NotFoundError(`No review with id ${reviewId}`);
    }
    if (!req.user) {
        throw new errors_1.UnauthorizedError("User not authenticated");
    }
    // Assuming req.user._id is a string
    const userIdString = ((_d = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString()) || "";
    // Convert the string to ObjectId
    const userIdObjectId = new mongoose_1.default.Types.ObjectId(userIdString);
    checkPermissions({ role: (_e = req.user) === null || _e === void 0 ? void 0 : _e.role, _id: userIdObjectId }, ((_f = review.user) === null || _f === void 0 ? void 0 : _f.toString()) || "");
    review.rating = rating;
    review.title = title;
    review.comment = comment;
    yield review.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ review });
});
exports.updateReview = updateReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h, _j;
    const { id: reviewId } = req.params;
    const review = yield Review_1.default.findOne({ _id: reviewId });
    if (!review) {
        throw new errors_1.NotFoundError(`No review with id ${reviewId}`);
    }
    // Assuming req.user._id is a string
    const userIdString = (_j = (_h = (_g = req.user) === null || _g === void 0 ? void 0 : _g._id) === null || _h === void 0 ? void 0 : _h.toString()) !== null && _j !== void 0 ? _j : "";
    // Convert the string to ObjectId
    const userIdObjectId = new mongoose_1.default.Types.ObjectId(userIdString);
    checkPermissions({ role: req.user.role, _id: userIdObjectId }, review.user.toString() || "");
    yield review.deleteOne();
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Success! Review removed" });
});
exports.deleteReview = deleteReview;
const getSingleProductReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    const reviews = yield Review_1.default.find({ product: productId });
    res.status(http_status_codes_1.StatusCodes.OK).json({ reviews, count: reviews.length });
});
exports.getSingleProductReviews = getSingleProductReviews;
