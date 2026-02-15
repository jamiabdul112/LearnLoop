import express from "express";
import { addReview, getReviewsForUser } from "../controllers/review.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/add-review", protectRoute, addReview);
router.get("/:userId", getReviewsForUser);

export default router;
