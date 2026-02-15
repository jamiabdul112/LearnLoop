import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
// @desc Create a chat room (after trade acceptance)
// @route POST /api/chats/create-chat
// @access Private
// ✅ Fix in createChat
export const createChat = async (req, res) => {
  try {
    const { participants, tradeId } = req.body; // 🔥 Accept tradeId from body

    if (!participants || participants.length < 2) {
      return res.status(400).json({ message: "At least two participants required" });
    }

    const chat = await Chat.create({ 
      participants, 
      tradeId, // 🔥 Save it here
      messages: [] 
    });

    // Note: Make sure 'User' is imported in this file!
    await User.updateMany( 
      { _id: { $in: participants } }, 
      { $push: { chats: chat._id } } 
    );

    res.status(201).json({ message: "Chat created successfully", chat });
  } catch (error) {
    console.error("createChat error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Send a message
// @route POST /api/chats/:id/send-message
// @access Private
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    const newMessage = {
      sender: req.user._id,
      text,
      timestamp: new Date(),
      systemMessage: false,
    };

    chat.messages.push(newMessage);
    await chat.save();

    res.status(200).json({ message: "Message sent", chat });
  } catch (error) {
    console.error("sendMessage error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Get all chats for a user
// @route GET /api/chats
// @access Private
// ✅ Fix in getUserChats
export const getUserChats = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate("participants", "name email profileImg")
      .populate("tradeId") // 🔥 CRITICAL: Frontend needs this for selectedChat.tradeId
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("getUserChats error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Get messages in a chat
// @route GET /api/chats/:id/messages
// @access Private
export const getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id).populate("messages.sender", "name email profileImg");

    if (!chat) return res.status(404).json({ message: "Chat not found" });

    res.status(200).json(chat.messages);
  } catch (error) {
    console.error("getChatMessages error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
