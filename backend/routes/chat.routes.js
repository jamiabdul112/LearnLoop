import express from "express";
import {
  createChat,
  sendMessage,
  getUserChats,
  getChatMessages,
} from "../controllers/chat.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/create-chat", protectRoute, createChat);
router.post("/:id/send-message", protectRoute, sendMessage);
router.get("/", protectRoute, getUserChats);
router.get("/:id/messages", protectRoute, getChatMessages);

export default router;
