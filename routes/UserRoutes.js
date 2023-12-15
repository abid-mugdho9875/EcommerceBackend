"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controllers/UserController");
const Authentication_1 = require("../middleware/Authentication");
const router = express_1.default.Router();
router
    .route("/")
    .get(Authentication_1.authenticateUser, (0, Authentication_1.authorizePermissions)("admin"), (req, res) => (0, UserController_1.getAllUsers)(req, res));
router
    .route("/showMe")
    .get(Authentication_1.authenticateUser, (req, res) => (0, UserController_1.showCurrentUser)(req, res));
router
    .route("/updateUser")
    .patch(Authentication_1.authenticateUser, (req, res) => (0, UserController_1.updateUser)(req, res));
router
    .route("/updateUserPassword")
    .patch(Authentication_1.authenticateUser, (req, res) => (0, UserController_1.updateUserPassword)(req, res));
router
    .route("/:id")
    .get(Authentication_1.authenticateUser, (req, res) => (0, UserController_1.getSingleUser)(req, res));
exports.default = router;
