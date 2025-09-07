import { registerUser, loginUser } from "../controllers/user.controllers.js";
import isAuthenticated from "../middleware/authentication.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/register", isAuthenticated, registerUser);
router.post("/login", isAuthenticated, registerUser);

export default router;
