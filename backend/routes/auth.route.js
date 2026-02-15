import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/auth.controllers.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protectRoute, getUserProfile);
router.put("/profile", protectRoute, updateUserProfile); 

export default router;
