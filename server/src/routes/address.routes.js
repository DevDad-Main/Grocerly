import { Router } from "express";
import {
  addAddress,
  deleteAddressById,
  getUserAddresses,
} from "../controllers/address.controllers.js";
import { isAuthenticated } from "../middleware/authentication.middleware.js";

const router = Router();

router.get("/get-addresses", isAuthenticated, getUserAddresses);
router.post("/add-address", isAuthenticated, addAddress);
router.delete("/delete/:id", isAuthenticated, deleteAddressById);

export default router;
