import {
  registerUser,
  loginUser,
  logoutUser,
  getUserAuthentication,
  googleLogin,
  getUserPoints,
} from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import { Router } from "express";
import {
  validateSignup,
  validateSignin,
} from "../middleware/validation.middleware.js";

const router = Router();

router.get("/logout", isAuthenticated, logoutUser);
router.get("/user-authenticated", isAuthenticated, getUserAuthentication);
router.get("/points", isAuthenticated, getUserPoints);
router.post("/register", validateSignup, registerUser);
router.post("/login", validateSignin, loginUser);
router.post("/google-login", googleLogin);

export default router;
