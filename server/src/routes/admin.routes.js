import { Router } from "express";
import isAdminAuthenticated from "../middleware/adminAuthentication.middleware.js";
import {
  adminLogin,
  adminLogout,
  getAdminAuthentication,
} from "../controllers/admin.controllers.js";

const router = Router();

router.post("/login", adminLogin);
router.get("/logout", isAdminAuthenticated, adminLogout);
router.get(
  "/admin-authenticated",
  isAdminAuthenticated,
  getAdminAuthentication,
);

export default router;
