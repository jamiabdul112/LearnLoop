import TradeRequest from "../models/trade.model.js";
/* import Review from "../models/Review.js"; */ // assuming you have a Review model

// @desc Send a trade request
// @route POST /api/trades/send-request
// @access Private
export const sendTradeRequest = async (req, res) => {
  try {
    const { toUser, skillOffered, skillWanted } = req.body;

    // Check if user is trying to trade with themselves
    if (toUser === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot trade with yourself" });
    }

    const trade = await TradeRequest.create({
      fromUser: req.user._id,
      toUser,
      skillOffered,
      skillWanted,
      status: "pending",
    });

    res.status(201).json({ message: "Trade request sent", trade });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Respond to a trade request
// @route PUT /api/trades/respond/:id
// @access Private
export const respondTradeRequest = async (req, res) => {
  try {
    const { status } = req.body; // accepted or rejected
    const trade = await TradeRequest.findById(req.params.id);

    if (!trade) return res.status(404).json({ message: "Trade request not found" });

    if (trade.toUser.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to respond" });
    }

    trade.status = status;
    await trade.save();

    res.json({ message: `Trade request ${status}`, trade });
  } catch (error) {
    console.error("respondTradeRequest error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Mark trade as complete
// @route PUT /api/trades/complete/:id
// @access Private
export const markTradeComplete = async (req, res) => {
  try {
    const trade = await TradeRequest.findById(req.params.id);

    if (!trade) return res.status(404).json({ message: "Trade request not found" });

    if (trade.status !== "accepted") {
      return res.status(400).json({ message: "Trade must be accepted before completion" });
    }

    if (trade.status == "completed") {
      return res.status(400).json({ message: "Trade is already completed" });
    }

    trade.status = "completed";
    await trade.save();

    res.json({ message: "Trade marked as completed", trade });
  } catch (error) {
    console.error("markTradeComplete error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Rate user after trade
// @route POST /api/trades/rate/:id
// @access Private
/* export const rateUserAfterTrade = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const trade = await TradeRequest.findById(req.params.id);

    if (!trade) return res.status(404).json({ message: "Trade request not found" });
    if (trade.status !== "completed") {
      return res.status(400).json({ message: "Trade must be completed before rating" });
    }

    const review = await Review.create({
      reviewer: req.user._id,
      reviewedUser: trade.toUser,
      rating,
      comment,
      tradeId: trade._id,
    });

    res.status(201).json({ message: "Review submitted", review });
  } catch (error) {
    console.error("rateUserAfterTrade error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}; */


export const getUserTrades = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ Trades where this user is the recipient (toUser) and has accepted
    const approvedReceived = await TradeRequest.find({
      toUser: userId,
      status: "accepted",
    })
      .populate("fromUser", "name profileImg")
      .populate("toUser", "name profileImg")
      .populate("skillOffered", "title category")
      .populate("skillWanted", "title category");

    // ✅ Trades where this user is the sender (fromUser) and the other user accepted
    const approvedSent = await TradeRequest.find({
      fromUser: userId,
      status: "accepted",
    })
      .populate("fromUser", "name profileImg")
      .populate("toUser", "name profileImg")
      .populate("skillOffered", "title category")
      .populate("skillWanted", "title category");

    res.status(200).json({
      approvedReceived,
      approvedSent,
    });
  } catch (error) {
    console.error("getUserTrades error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getIncomingTrades = async (req, res) => {
  try {
    const userId = req.user._id;

    // ✅ ADD THIS: status: "pending"
    const incomingTrades = await TradeRequest.find({ 
      toUser: userId, 
      status: "pending"  // Only show requests that haven't been answered!
    })
      .populate("fromUser", "name profileImg address")
      .populate("toUser", "name profileImg address")
      .populate("skillOffered", "title category")
      .populate("skillWanted", "title category");

    // Remove the 404 check if you want to return an empty array [] instead of an error
    res.status(200).json(incomingTrades || []);
  } catch (error) {
    console.error("getIncomingTrades error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};