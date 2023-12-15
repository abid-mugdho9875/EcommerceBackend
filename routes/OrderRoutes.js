"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Authentication_1 = require("../middleware/Authentication");
const OrderController_1 = require("../controllers/OrderController");
const router = express_1.default.Router();
router
    .route("/")
    .post(Authentication_1.authenticateUser, (req, res) => (0, OrderController_1.createOrder)(req, res))
    .get(Authentication_1.authenticateUser, (0, Authentication_1.authorizePermissions)("admin"), (req, res) => (0, OrderController_1.getAllOrders)(req, res));
router
    .route("/showAllMyOrders")
    .get(Authentication_1.authenticateUser, (req, res) => (0, OrderController_1.getCurrentUserOrders)(req, res));
router
    .route("/:id")
    .get(Authentication_1.authenticateUser, (req, res) => (0, OrderController_1.getSingleOrder)(req, res))
    .patch(Authentication_1.authenticateUser, (req, res) => (0, OrderController_1.updateOrder)(req, res));
exports.default = router;
