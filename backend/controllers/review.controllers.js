import Review from "../models/review.model.js";
import TradeRequest from "../models/trade.model.js";
import User from "../models/user.model.js";

// @desc Add a review
// @route POST /api/reviews/add-review
// @access Private
export const addReview = async (req, res) => {
  try {
    const { reviewedUser, rating, feedback, tradeId } = req.body;

    if (!reviewedUser || !rating || !feedback || !tradeId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ Check trade status
    const trade = await TradeRequest.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ message: "Trade not found" });
    }
    if (trade.status !== "completed") {
      return res.status(400).json({ message: "You can only review after trade completion" });
    }

    // ✅ Create review
    const review = await Review.create({
      reviewer: req.user._id,
      reviewedUser,
      rating,
      feedback,
      tradeId,
    });

    // ✅ Push review into reviewed user’s profile
    await User.findByIdAndUpdate(reviewedUser, {
      $push: { reviews: review._id }
    });

    res.status(201).json({ message: "Review added successfully", review });
  } catch (error) {
    console.error("addReview error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// @desc Get reviews for a user
// @route GET /api/reviews/:userId
// @access Public
export const getReviewsForUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUser: req.params.userId })
      .populate("reviewer", "name email profileImg")
      .populate("tradeId", "status createdAt");

    res.status(200).json(reviews);
  } catch (error) {
    console.error("getReviewsForUser error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


