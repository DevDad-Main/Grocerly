import { Router } from "express";
import isAuthenticated from "../middleware/authentication.middleware.js";
import { updateUserCart } from "../controllers/cart.controllers.js";

const router = Router();

router.post("/update-cart", isAuthenticated, updateUserCart);

export default router;
