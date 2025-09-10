import { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import {
  getDeliverySlots,
  reserveDeliverySlot,
} from "../controllers/deliverySlot.controllers.js";

const router = Router();

router.get("/slots", isAuthenticated, getDeliverySlots);
router.post("/slots/reserve", isAuthenticated, reserveDeliverySlot);

export default router;
