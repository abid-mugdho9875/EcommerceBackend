import express, { Request, Response, Router } from "express";
import {
  authenticateUser,
  authorizePermissions,
} from "../middleware/Authentication";

// Define your additional properties in CustomRequest
interface CustomRequest extends Request {
  _id: string;
  // Add other properties as needed
}

import {
  createOrder,
  getAllOrders,
  getCurrentUserOrders,
  getSingleOrder,
  updateOrder,
} from "../controllers/OrderController";

const router: Router = express.Router();

router
  .route("/")
  .post(authenticateUser, (req: Request, res: Response) =>
    createOrder(req as CustomRequest, res)
  )
  .get(
    authenticateUser,
    authorizePermissions("admin"),
    (req: Request, res: Response) => getAllOrders(req as CustomRequest, res)
  );

router
  .route("/showAllMyOrders")
  .get(authenticateUser, (req: Request, res: Response) =>
    getCurrentUserOrders(req as CustomRequest, res)
  );

router
  .route("/:id")
  .get(authenticateUser, (req: Request, res: Response) =>
    getSingleOrder(req as CustomRequest, res)
  )
  .patch(authenticateUser, (req: Request, res: Response) =>
    updateOrder(req as CustomRequest, res)
  );

export default router;
