import { Router } from "express";
import isAdminAuthenticated from "../middleware/adminAuthentication.middleware.js";
import {
  adminLogin,
  adminLogout,
  getProductById,
  getAdminAuthentication,
  deleteProduct,
  updateProduct,
  getDashboard,
} from "../controllers/admin.controllers.js";
import { upload } from "../utils/multer.utils.js";

const router = Router();

router.get("/logout", isAdminAuthenticated, adminLogout);
router.get(
  "/admin-authenticated",
  isAdminAuthenticated,
  getAdminAuthentication,
);
router.get("/product/:id", isAdminAuthenticated, getProductById);
router.get("/dashboard", isAdminAuthenticated, getDashboard);

router.post("/login", adminLogin);
router.put(
  "/product-update/:id",
  upload.array("images"),
  isAdminAuthenticated,
  updateProduct,
);
router.patch("/delete-product", isAdminAuthenticated, deleteProduct);

export default router;
