import { Router } from "express";
import {
  addAddress,
  getUserAddresses,
} from "../controllers/address.controllers";
import { isAuthenticated } from "../middleware/authentication.middleware.js";

const router = Router();

router.get("/get-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addAddress);

export default router();
