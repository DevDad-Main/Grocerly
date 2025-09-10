import { Router } from "express";
import { getDraftOrder } from "../controllers/draftOrder.controllers.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";

const router = Router();

router.get("/order", isAuthenticated, getDraftOrder);

export default router;
