import { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import {
  getUserCart,
  addItemToCart,
  removeItemFromCart,
  updateUserCart,
} from "../controllers/cart.controllers.js";

const router = Router();

router.get("/get-cart", isAuthenticated, getUserCart);
// router.put("/update-cart", isAuthenticated, updateUserCart);
router.post("/add-to-cart", isAuthenticated, addItemToCart);
router.patch("/remove-from-cart", isAuthenticated, removeItemFromCart);
export default router;
