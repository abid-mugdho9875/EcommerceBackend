import express, { Router } from "express";
import { login, logout, register } from "../controllers/AuthController";

const router: Router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

export default router;
