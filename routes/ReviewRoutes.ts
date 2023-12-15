import express, { Request, Response, Router } from "express";
import { authenticateUser } from "../middleware/Authentication";

// Define your additional properties in CustomRequest
interface CustomRequest extends Request {
  _id: string;
  // Add other properties as needed
}

import {
  createReview,
  deleteReview,
  getAllReviews,
  getSingleReview,
  updateReview,
} from "../controllers/ReviewController";

const router: Router = express.Router();

router
  .route("/")
  .post(authenticateUser, (req: Request, res: Response) =>
    createReview(req as CustomRequest, res)
  )
  .get(authenticateUser, (req: Request, res: Response) =>
    getAllReviews(req as CustomRequest, res)
  );

router
  .route("/:id")
  .get(authenticateUser, (req: Request, res: Response) =>
    getSingleReview(req as CustomRequest, res)
  )
  .patch(authenticateUser, (req: Request, res: Response) =>
    updateReview(req as CustomRequest, res)
  )
  .delete(authenticateUser, (req: Request, res: Response) =>
    deleteReview(req as CustomRequest, res)
  );

export default router;
