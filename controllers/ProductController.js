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
exports.updateProduct = exports.getSingleProduct = exports.getAllProducts = exports.deleteProduct = exports.createProduct = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const Product_1 = require("../models/Product");
const Review_1 = __importDefault(require("../models/Review"));
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    req.body.user = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    console.log(req.body.user);
    console.log((_b = req.user) === null || _b === void 0 ? void 0 : _b._id);
    const product = yield Product_1.ProductModel.create(req.body);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ product });
});
exports.createProduct = createProduct;
const getAllProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield Product_1.ProductModel.find({}).populate("reviews");
    res.status(http_status_codes_1.StatusCodes.OK).json({ products, count: products.length });
});
exports.getAllProducts = getAllProducts;
const getSingleProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    const product = yield Product_1.ProductModel.findOne({ _id: productId }).populate("reviews");
    if (!product) {
        throw new errors_1.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ product });
});
exports.getSingleProduct = getSingleProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    const product = yield Product_1.ProductModel.findOneAndUpdate({ _id: productId }, req.body, {
        new: true,
        runValidators: true,
    });
    if (!product) {
        throw new errors_1.NotFoundError(`No product with id : ${productId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ product });
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: productId } = req.params;
    const product = yield Product_1.ProductModel.findOne({ _id: productId });
    if (!product) {
        throw new errors_1.NotFoundError(`No product with id : ${productId}`);
    }
    yield product.deleteOne();
    yield Review_1.default.deleteMany({ product: productId });
    res.status(http_status_codes_1.StatusCodes.OK).json({ msg: "Success! Product removed." });
});
exports.deleteProduct = deleteProduct;
