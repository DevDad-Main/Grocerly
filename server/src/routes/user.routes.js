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

const router = Router();

router.get("/logout", isAuthenticated, logoutUser);
router.get("/user-authenticated", isAuthenticated, getUserAuthentication);
router.get("/points", isAuthenticated, getUserPoints);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

export default router;
