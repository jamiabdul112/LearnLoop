import mongoose from "mongoose";

const tradeRequestSchema = new mongoose.Schema(
  {
    fromUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    toUser: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    skillOffered: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Skill", 
        required: true 
    },
    skillWanted: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Skill", 
        required: true 
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    chatId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Chat" 
    }, // optional
  },
  { timestamps: true }
);

const TradeRequest = mongoose.model("TradeRequest", tradeRequestSchema);
export default TradeRequest;
