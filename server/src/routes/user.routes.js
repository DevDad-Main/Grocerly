import { registerUser } from "../controllers/user.controllers.js";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);

export default router;
