import { Router } from "express";
import isAdminAuthenticated from "../middleware/adminAuthentication.middleware";
import { adminLogin, adminLogout } from "../controllers/admin.controllers";

const router = Router();

router.post("/login", isAdminAuthenticated, adminLogin);
router.get("/logout", isAdminAuthenticated, adminLogout);

export default router;
