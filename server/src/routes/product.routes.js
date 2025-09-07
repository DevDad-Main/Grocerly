import { Router } from "express";
import { addProduct } from "../controllers/product.controllers.js";
import { upload } from "../utils/multer.utils.js";

const router = Router();

router.post(
  "/add-product",
  upload.fields([
    {
      name: "images",
      maxCount: 4,
    },
  ]),
  addProduct,
);

export default router;
