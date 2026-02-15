import { Server } from "socket.io";
import Chat from "../models/chat.model.js";
import mongoose from "mongoose"; // ✅ YOU NEED THIS IMPORT

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

    // ✅ THE UPDATED SEND MESSAGE BLOCK
    socket.on("sendMessage", async ({ chatId, senderId, text }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat) {
          const newMessage = {
            sender: senderId,
            text,
            timestamp: new Date(),
            systemMessage: false,
          };

          chat.messages.push(newMessage);
          await chat.save();

          // ✅ Fetch sender details so the frontend has the name/image immediately
          const User = mongoose.model("User");
          const sender = await User.findById(senderId).select("name profileImg");

          // ✅ Broadcast the message with the populated sender object to the room
          io.to(chatId).emit("newMessage", {
            ...newMessage,
            sender // Now this is { _id, name, profileImg }
          });
        }
      } catch (error) {
        console.error("Socket sendMessage error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};