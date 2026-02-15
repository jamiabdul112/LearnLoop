import { Server } from "socket.io";
import Chat from "../models/chat.model.js";
import mongoose from "mongoose";

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("joinChat", (chatId) => {
      socket.join(chatId);
      console.log(`User joined chat ${chatId}`);
    });

    // ✅ ONLY ONE sendMessage BLOCK - Merged and Corrected
    socket.on("sendMessage", async ({ chatId, senderId, text, isTradeProposal }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          const newMessage = {
            sender: senderId,
            text,
            timestamp: new Date(),
            isTradeProposal: isTradeProposal || false, 
            tradeStatus: isTradeProposal ? "pending" : undefined,
            systemMessage: false,
          };

          chat.messages.push(newMessage);
          const savedChat = await chat.save();
          
          // ✅ CRITICAL: Get the message directly from the saved chat to get the MongoDB _id
          const lastSavedMsg = savedChat.messages[savedChat.messages.length - 1];

          const User = mongoose.model("User");
          const sender = await User.findById(senderId).select("name profileImg");

          // ✅ Broadcast the SAVED message (with the ID) so the frontend can respond to it
          io.to(chatId).emit("newMessage", {
            ...lastSavedMsg.toObject(),
            sender 
          });
        }
      } catch (error) {
        console.error("Socket sendMessage error:", error);
      }
    });

    // ✅ DON'T FORGET THIS: This handles the Accept/Reject buttons
    socket.on("respondToTrade", async ({ chatId, messageId, action }) => {
        try {
            const status = action === "accept" ? "completed" : "rejected";
            
            const chat = await Chat.findOneAndUpdate(
                { _id: chatId, "messages._id": messageId },
                { $set: { "messages.$.tradeStatus": status } },
                { new: true }
            );

            if (chat) {
                io.to(chatId).emit("tradeStatusUpdated", { messageId, status });
            }
        } catch (err) {
            console.error("respondToTrade error:", err);
        }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};