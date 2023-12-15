"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Authentication_1 = require("../middleware/Authentication");
const ProductController_1 = require("../controllers/ProductController");
const ReviewController_1 = require("../controllers/ReviewController");
const router = express_1.default.Router();
router
    .route("/")
    .post([Authentication_1.authenticateUser, (0, Authentication_1.authorizePermissions)("admin")], (req, res) => (0, ProductController_1.createProduct)(req, res))
    .get((req, res) => (0, ProductController_1.getAllProducts)(req, res));
// router
//   .route("/uploadImage")
//   .post(
//     [authenticateUser, authorizePermissions("admin")],
//     (req: Request, res: Response) => uploadImage(req, res)
//   );
router
    .route("/:id")
    .get((req, res) => (0, ProductController_1.getSingleProduct)(req, res))
    .patch([Authentication_1.authenticateUser, (0, Authentication_1.authorizePermissions)("admin")], (req, res) => (0, ProductController_1.updateProduct)(req, res))
    .delete([Authentication_1.authenticateUser, (0, Authentication_1.authorizePermissions)("admin")], (req, res) => (0, ProductController_1.deleteProduct)(req, res));
router
    .route("/:id/reviews")
    .get((req, res) => (0, ReviewController_1.getSingleProductReviews)(req, res));
exports.default = router;
