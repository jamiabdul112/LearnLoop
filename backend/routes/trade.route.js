import express from "express";
import {
  sendTradeRequest,
  respondTradeRequest,
  markTradeComplete,
  getUserTrades,
  getIncomingTrades,
  /* rateUserAfterTrade, */
} from "../controllers/trade.controllers.js";
import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.post("/send-request", protectRoute, sendTradeRequest);
router.put("/respond/:id", protectRoute, respondTradeRequest);
router.put("/complete/:id", protectRoute, markTradeComplete);

router.get("/my-trades", protectRoute, getUserTrades);
router.get("/incoming", protectRoute, getIncomingTrades);
/* router.post("/rate/:id", protectRoute, rateUserAfterTrade); */

export default router;
