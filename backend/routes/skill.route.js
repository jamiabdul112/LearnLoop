import express from "express";
import { createSkill, getSkillsByCategory, getSkillDetails, deleteSkill, getUserSkills } from "../controllers/skill.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

// Create a new skill (requires login)
router.post("/", protectRoute, createSkill);

// Get skills by category (public)
router.get("/", getSkillsByCategory);

// Get skill details (public)
router.get("/:id", getSkillDetails);

router.delete("/:id", protectRoute, deleteSkill);

router.get("/user/:id", protectRoute, getUserSkills)


export default router;
