import { Router } from "express";
import { isAuthenticated } from "../middleware/authentication.middleware.js";
import {
  getDeliverySlots,
  releaseDeliverySlot,
  reserveDeliverySlot,
} from "../controllers/deliverySlot.controllers.js";

const router = Router();

router.get("/slots", isAuthenticated, getDeliverySlots);
router.post("/slots/reserve", isAuthenticated, reserveDeliverySlot);
router.post("/slots/release", isAuthenticated, releaseDeliverySlot);

export default router;
