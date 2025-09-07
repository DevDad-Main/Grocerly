import { Router } from "express";
import isAdminAuthenticated from "../middleware/adminAuthentication.middleware.js";
import { adminLogin, adminLogout } from "../controllers/admin.controllers.js";

const router = Router();

router.post("/login", isAdminAuthenticated, adminLogin);
router.get("/logout", isAdminAuthenticated, adminLogout);

export default router;
