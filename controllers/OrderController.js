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
exports.updateOrder = exports.getSingleOrder = exports.getCurrentUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const fakeStripeAPI = ({ amount, currency, }) => __awaiter(void 0, void 0, void 0, function* () {
    const client_secret = "someRandomValue";
    return { client_secret, amount };
});
const checkPermissions = (requestUser, resourceUserId) => {
    if (requestUser.role === "admin")
        return;
    if (requestUser._id.toString() === resourceUserId)
        return;
    throw new errors_1.UnauthorizedError("Not authorized to access this route");
};
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { items: cartItems, tax, shippingFee } = req.body;
    if (!cartItems || cartItems.length < 1) {
        throw new errors_1.BadRequestError("No cart items provided");
    }
    if (!tax || !shippingFee) {
        throw new errors_1.BadRequestError("Please provide tax and shipping fee");
    }
    let orderItems = [];
    let subtotal = 0;
    for (const item of cartItems) {
        const dbProduct = yield Product_1.ProductModel.findOne({ _id: item.product });
        if (!dbProduct) {
            throw new errors_1.NotFoundError(`No product with id : ${item.product}`);
        }
        const { name, price, image, _id } = dbProduct;
        const singleOrderItem = {
            amount: item.amount,
            name,
            price,
            image,
            product: _id,
        };
        orderItems = [...orderItems, singleOrderItem];
        subtotal += item.amount * price;
    }
    const total = shippingFee + tax + subtotal;
    const paymentIntent = yield fakeStripeAPI({
        amount: total,
        currency: "usd",
    });
    const order = yield Order_1.OrderModel.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret: paymentIntent.client_secret,
        user: ((_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
    });
    res
        .status(http_status_codes_1.StatusCodes.CREATED)
        .json({ order, clientSecret: order.clientSecret });
});
exports.createOrder = createOrder;
const getAllOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield Order_1.OrderModel.find({});
    res.status(http_status_codes_1.StatusCodes.OK).json({ orders, count: orders.length });
});
exports.getAllOrders = getAllOrders;
const getSingleOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const { id: orderId } = req.params;
    const order = yield Order_1.OrderModel.findOne({ _id: orderId });
    if (!order) {
        throw new errors_1.NotFoundError(`No order with id : ${orderId}`);
    }
    if (req.user) {
        // Assuming req.user is of type IUser or similar
        checkPermissions({ role: req.user.role, _id: req.user._id }, ((_c = order.user) === null || _c === void 0 ? void 0 : _c.toString()) || "");
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ order });
});
exports.getSingleOrder = getSingleOrder;
const getCurrentUserOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const orders = yield Order_1.OrderModel.find({
        user: ((_d = req.user) === null || _d === void 0 ? void 0 : _d._id) ? req.user._id.toString() : "",
    });
    res.status(http_status_codes_1.StatusCodes.OK).json({ orders, count: orders.length });
});
exports.getCurrentUserOrders = getCurrentUserOrders;
const updateOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { id: orderId } = req.params;
    const { paymentIntentId } = req.body;
    const order = yield Order_1.OrderModel.findOne({ _id: orderId });
    if (!order) {
        throw new errors_1.NotFoundError(`No order with id : ${orderId}`);
    }
    if (req.user) {
        console.log("req.user._id:", (_e = req.user) === null || _e === void 0 ? void 0 : _e._id);
        console.log("order.user:", order.user);
        checkPermissions({ role: req.user.role, _id: req.user._id }, ((_f = order.user) === null || _f === void 0 ? void 0 : _f.toString()) || "");
    }
    order.paymentIntentId = paymentIntentId;
    order.status = "paid";
    yield order.save();
    res.status(http_status_codes_1.StatusCodes.OK).json({ order });
});
exports.updateOrder = updateOrder;
