import express, { Request, Response, Router } from "express";
import {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
} from "../controllers/UserController";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/Authentication";

const router: Router = express.Router();

router
  .route("/")
  .get(
    authenticateUser,
    authorizePermissions("admin"),
    (req: Request, res: Response) => getAllUsers(req, res)
  );

router
  .route("/showMe")
  .get(authenticateUser, (req: Request, res: Response) =>
    showCurrentUser(req, res)
  );

router
  .route("/updateUser")
  .patch(authenticateUser, (req: Request, res: Response) =>
    updateUser(req, res)
  );

router
  .route("/updateUserPassword")
  .patch(authenticateUser, (req: Request, res: Response) =>
    updateUserPassword(req, res)
  );

router
  .route("/:id")
  .get(authenticateUser, (req: Request, res: Response) =>
    getSingleUser(req, res)
  );

export default router;
