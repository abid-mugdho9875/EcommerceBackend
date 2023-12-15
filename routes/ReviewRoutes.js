"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Authentication_1 = require("../middleware/Authentication");
const ReviewController_1 = require("../controllers/ReviewController");
const router = express_1.default.Router();
router
    .route("/")
    .post(Authentication_1.authenticateUser, (req, res) => (0, ReviewController_1.createReview)(req, res))
    .get(Authentication_1.authenticateUser, (req, res) => (0, ReviewController_1.getAllReviews)(req, res));
router
    .route("/:id")
    .get(Authentication_1.authenticateUser, (req, res) => (0, ReviewController_1.getSingleReview)(req, res))
    .patch(Authentication_1.authenticateUser, (req, res) => (0, ReviewController_1.updateReview)(req, res))
    .delete(Authentication_1.authenticateUser, (req, res) => (0, ReviewController_1.deleteReview)(req, res));
exports.default = router;
