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
  createProduct,
  deleteProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
} from "../controllers/ProductController";

import { getSingleProductReviews } from "../controllers/ReviewController";

const router: Router = express.Router();

router
  .route("/")
  .post(
    [authenticateUser, authorizePermissions("admin")],
    (req: Request, res: Response) => createProduct(req as CustomRequest, res)
  )
  .get((req: Request, res: Response) =>
    getAllProducts(req as CustomRequest, res)
  );

// router
//   .route("/uploadImage")
//   .post(
//     [authenticateUser, authorizePermissions("admin")],
//     (req: Request, res: Response) => uploadImage(req, res)
//   );

router
  .route("/:id")
  .get((req: Request, res: Response) =>
    getSingleProduct(req as CustomRequest, res)
  )
  .patch(
    [authenticateUser, authorizePermissions("admin")],
    (req: Request, res: Response) => updateProduct(req as CustomRequest, res)
  )
  .delete(
    [authenticateUser, authorizePermissions("admin")],
    (req: Request, res: Response) => deleteProduct(req as CustomRequest, res)
  );

router
  .route("/:id/reviews")
  .get((req: Request, res: Response) => getSingleProductReviews(req, res));

export default router;
