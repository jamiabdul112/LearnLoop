import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    },
    text: { 
        type: String, 
        required: true 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    },
    isTradeProposal: { 
      type: Boolean, 
      default: false 
    },
    tradeStatus: { 
        type: String, 
        enum: ["pending", "completed", "rejected"], 
        default: "pending" 
    },
    systemMessage: { 
        type: Boolean, 
        default: false 
    }, // for trade notifications
  },
  { _id: true }
);

const chatSchema = new mongoose.Schema(
  {
    participants: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }],
    messages: [messageSchema],
    tradeId: { type: mongoose.Schema.Types.ObjectId, ref: "TradeRequest" }
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema);
export default Chat;
