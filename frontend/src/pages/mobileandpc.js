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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
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
    <div className="chatPage-page">
        <div className="chatPage-wrapper">

            {/* 1. CHAT LIST PANEL */}
            {/* Logic: On mobile, hide list if a chat is selected. On PC, always show. */}
            {(!isMobile || !selectedChat) && (
            <div className="chatPage-list">
                <div className="list-header">
                <div className="title-row">
                    <h2>Chats</h2>
                    <IoChatbubbles className="icon-main" />
                </div>
                <div className="search-bar">
                    <IoIosSearch />
                    <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="chat-search" 
                    />
                </div>
                </div>

                <div className="list-container">
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
                        <div className="chat-item-info">
                            <p className="chat-name">{otherUser?.name}</p>
                            <p className="chat-last-msg">
                            {lastMessage ? lastMessage.text : "No messages yet"}
                            </p>
                        </div>
                        </div>
                    );
                    })
                ) : (
                    <p className="no-data">No chats yet.</p>
                )}
                </div>
            </div>
            )}

            {/* 2. MESSAGES PANEL */}
            {/* Logic: On mobile, only show if a chat is selected. On PC, show placeholder if none. */}
            {(!isMobile || selectedChat) && (
            <div className="chatPage-window">
                {selectedChat ? (
                <div className="chat-window-content">
                    <div className="chat-window-header">
                    {/* Back Button for Mobile Navigation */}
                    {isMobile && (
                        <button className="back-btn" onClick={() => setSelectedChat(null)}>
                        ←
                        </button>
                    )}
                    
                    <div className="header-user-info">
                        <img
                        src={selectedChat.participants.find((p) => p._id !== authUser?._id)?.profileImg || defaultImg}
                        alt="profile"
                        className="chat-avatar-small"
                        />
                        <h3>{selectedChat.participants.find((p) => p._id !== authUser?._id)?.name}</h3>
                    </div>

                    <div className="header-actions">
                        <button className="complete-btn">Complete Trade</button>
                        <button className="call-btn"><IoMdCall /></button>
                    </div>
                    </div>

                    <div className="chat-messages-scroll">
                    {liveMessages?.length > 0 ? (
                        <>
                        <p className="convo-divider">CONVERSATION STARTED</p>
                        {liveMessages.map((msg, idx) => {
                            const isSentByMe = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;
                            return (
                            <div key={idx} className={`message-row ${isSentByMe ? "sent" : "received"}`}>
                                <img
                                src={msg.sender?.profileImg || defaultImg}
                                className="msg-avatar"
                                alt=""
                                />
                                <div className="message-bubble">
                                {msg.text}
                                </div>
                            </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                        </>
                    ) : (
                        <p className="convo-divider">No messages yet</p>
                    )}
                    </div>

                    <div className="chat-input-container">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <button className="send-btn" onClick={handleSendMessage} disabled={!messageText.trim()}>
                        <IoSend />
                    </button>
                    </div>
                </div>
                ) : (
                /* Desktop Empty State */
                <div className="chat-empty-state">
                    <IoChatbubbles />
                    <p>Select a chat to start messaging</p>
                </div>
                )}
            </div>
            )}
            
        </div>
        </div>
  );
}

export default ChatPage;
