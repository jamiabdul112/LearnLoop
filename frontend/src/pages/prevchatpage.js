import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { baseURL } from "../constants/baseUrl";
import { defaultImg } from "../constants/defaultImg";
import { IoSend } from "react-icons/io5";
import "../css/chatPage.css";
import { useRef } from "react";
import { IoChatbubbles } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { IoMdCall } from "react-icons/io";

// Change the socket init to include transport options if you face issues
const socket = io(baseURL, { 
  withCredentials: true,
  transports: ['websocket', 'polling'] 
});

function ChatPage() {
    
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [liveMessages, setLiveMessages] = useState([]);

  // ✅ Fetch all chats for logged-in user
  const { data: chats, isLoading: loadingChats } = useQuery({
    queryKey: ["userChats"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/chats`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch chats");
      return data;
    },
  });

  // ✅ Fetch messages for selected chat (initial load)
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;
      const res = await fetch(`${baseURL}/api/chats/${selectedChat._id}/messages`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setLiveMessages(data);
      }
    };
    fetchMessages();
  }, [selectedChat]);

  // ✅ Socket.IO setup
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected to socket:", socket.id);
    });

    socket.on("newMessage", (message) => {
      setLiveMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off("newMessage");
    };
  }, []);

  // ✅ Join chat room when selecting a chat
  useEffect(() => {
    if (selectedChat?._id) {
      socket.emit("joinChat", selectedChat._id);
    }
  }, [selectedChat]);

  // ✅ Send message via socket
  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat?._id) {
      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        senderId: authUser._id,
        text: messageText,
      });
      setMessageText("");
    }
  };

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Scroll whenever messages change
    useEffect(() => {
    scrollToBottom();
    }, [liveMessages]);


  if (loadingChats) return <p>Loading chats...</p>;

  return (
    <div className="chat-page">
      {/* LEFT PANEL: Chat List */}
      <div className={`chat-list ${selectedChat ? "hide-on-mobile" : ""}`}>
        <h2>Chats</h2>
        <IoChatbubbles />
        <IoIosSearch />
        <input type="text" placeholder="Search users..." className="chat-search" />
        {chats?.length > 0 ? (
          chats.map((chat) => {
            const otherUser = chat.participants.find((p) => p._id !== authUser?._id);
            const lastMessage = chat.messages?.[chat.messages.length - 1];
            return (
              <div
                key={chat._id}
                className={`chat-list-item ${selectedChat?._id === chat._id ? "active" : ""}`}
                onClick={() => setSelectedChat(chat)}
              >
                <img
                  src={otherUser?.profileImg || defaultImg}
                  alt="profile"
                  className="chat-avatar"
                />
                <div>
                  <p className="chat-name">{otherUser?.name}</p>
                  <p className="chat-last">
                    {lastMessage ? lastMessage.text : "No messages yet"}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p>No chats yet.</p>
        )}
      </div>

      {/* RIGHT PANEL: Messages */}
      <div className={`chat-window ${!selectedChat ? "hide-on-mobile" : ""}`}>
        {selectedChat ? (
          <>
            <div className="chat-header">
              <img
                src={
                  selectedChat.participants.find((p) => p._id !== authUser?._id)?.profileImg ||
                  defaultImg
                }
                alt="profile"
                className="chat-avatar"
              />
              <h3>
                {selectedChat.participants.find((p) => p._id !== authUser?._id)?.name}
              </h3>
              <button className="complete-btn">Complete Trade</button>
              <button className="call-btn"><IoMdCall /></button>
            </div>

            <div className="chat-messages">
              {liveMessages?.length > 0 ? (
                <>
                  <p className="conversation-start">Conversation started</p>
                  
                  {liveMessages.map((msg, idx) => {
                    // ✅ MOVE THE LOGIC HERE: Inside the map function
                    // We check ._id (for objects) or the value itself (for strings/IDs)
                    const isSentByMe = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;

                    return (
                      
                      <div
                        key={idx}
                        className={`chat-message ${isSentByMe ? "sent" : "received"}`}
                      >
                        <img
                          src={msg.sender?.profileImg || defaultImg}
                          alt="profile"
                          className="msg-avatar"
                        />
                        <div className="msg-text">{msg.text}</div>
                        
                      </div>
                      
                    );

                  })}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <p className="conversation-start">Conversation not started</p>
              )}
            </div>

            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage();
                }}
              />
              <button onClick={handleSendMessage} disabled={!messageText.trim()}>
                <IoSend />
              </button>
            </div>
          </>
        ) : (
          <p className="empty-chat">Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
