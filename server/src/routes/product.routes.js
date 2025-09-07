import { Router } from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  amendProductStock,
} from "../controllers/product.controllers.js";
import { upload } from "../utils/multer.utils.js";
import isAdminAuthenticated from "../middleware/adminAuthentication.middleware.js";

const router = Router();

router.get("/products", isAdminAuthenticated, getProducts);
router.get("/product/:id", isAdminAuthenticated, getProductById);
router.post(
  "/add-product",
  upload.array([images]),
  isAdminAuthenticated,
  addProduct,
);
router.patch("/stock", isAdminAuthenticated, amendProductStock);

export default router;
