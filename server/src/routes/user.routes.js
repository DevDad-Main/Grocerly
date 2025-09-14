import {
  registerUser,
  loginUser,
  logoutUser,
  getUserAuthentication,
  googleLogin,
} from "../controllers/user.controllers.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.get("/logout", isAuthenticated, logoutUser);
router.get("/user-authenticated", isAuthenticated, getUserAuthentication);

export default router;
