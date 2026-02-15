import React, { useState, useEffect } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { baseURL } from "../constants/baseUrl";
import { defaultImg } from "../constants/defaultImg";
import { IoSend } from "react-icons/io5";
import "../css/chatPage.css";
import { useRef } from "react";
import { IoChatbubbles } from "react-icons/io5";
import { IoIosSearch } from "react-icons/io";
import { IoMdCall } from "react-icons/io";
import { IoCallSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

// Change the socket init to include transport options if you face issues
const socket = io("https://learnloop-ybgi.onrender.com", { 
  withCredentials: true,
  transports: ['websocket', 'polling'] 
});

function ChatPage() {
    
  const queryClient = useQueryClient();
  const authUser = queryClient.getQueryData(["authUser"]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

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
      console.log("My Chats from Server:", data);
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

  const { mutate: completeTrade } = useMutation({
    mutationFn: async (tradeId) => {
      const res = await fetch(`${baseURL}/api/trades/complete/${tradeId}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to complete trade");
      return data;
    },
    onSuccess: (data) => {
      console.log("Trade marked as completed in DB");
      
      // Manually update the local liveMessages so the UI switches to "Rate Trade"
      setLiveMessages((prev) =>
        prev.map((msg) =>
          msg.isTradeProposal ? { ...msg, tradeStatus: "completed" } : msg
        )
      );
    },
    onError: (error) => {
      alert("Error: " + error.message);
    },
  });

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

   // ✅ Corrected Socket Listener
    useEffect(() => {
      const handleStatusUpdate = ({ messageId, status }) => {
        console.log("Status update received:", messageId, status); // Debug log
        setLiveMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, tradeStatus: status } : msg
          )
        );
      };

      socket.on("tradeStatusUpdated", handleStatusUpdate);
      
      return () => socket.off("tradeStatusUpdated");
    }, []); // Empty dependency array so it doesn't reset on every render

  // ✅ Send message via socket
  const handleSendMessage = () => {
    if (messageText.trim() && selectedChat?._id) {
      socket.emit("sendMessage", {
        chatId: selectedChat._id,
        senderId: authUser._id,
        text: messageText,
        isTradeProposal: false, // Explicitly tell the server it's NOT a trade
      });
      setMessageText("");
    }
  };

   const handleTradeProposal = () => {
      if (selectedChat?._id) {
          socket.emit("sendMessage", {
              chatId: selectedChat._id,
              senderId: authUser._id,
              // Keep the text simple; we will override it in the UI card below
              text: "Trade Completion Request", 
              isTradeProposal: true,
          });
      }
  };
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Filter logic: search by the other user's name
    const filteredChats = chats?.filter((chat) => {
      const otherUser = chat.participants.find((p) => p._id !== authUser?._id);
      return otherUser?.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Scroll whenever messages change
    useEffect(() => {
    scrollToBottom();
    }, [liveMessages]);


    const isTradeFinalized = liveMessages.some(msg => msg.isTradeProposal && msg.tradeStatus === "accepted");
  if (loadingChats) return <p>Loading chats...</p>;

  // Check if any message in the current chat is an accepted trade proposal


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
                    value={searchTerm} // Add this
                    onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                </div>

                <div className="list-container">
                {filteredChats?.length > 0 ? (
                    filteredChats.map((chat) => {
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
                    <p className="no-data" style={{textAlign:"center"}}>No chats yet.</p>
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
                    <div className="chat-window-header" >
                    {/* Back Button for Mobile Navigation */}
                    
                    
                    <div className="header-user-info">
                         {isMobile && (
                        <button className="back-btn" style={{margin:"0", padding:"0 3px", marginBottom:"0.4rem", fontSize:"16px"}} onClick={() => setSelectedChat(null)}>
                        ←
                        </button>
                    )}
                        <img
                        src={selectedChat.participants.find((p) => p._id !== authUser?._id)?.profileImg || defaultImg}
                        alt="profile"
                        className="chat-avatar-small"
                        />
                        <h3 className="chaterName">{selectedChat.participants.find((p) => p._id !== authUser?._id)?.name}</h3>
                    </div>

                    <div className="header-actions">
                      {/* Step 1: Check if the trade is ALREADY completed */}
                      {liveMessages.some(m => m.tradeStatus === "completed") ? (
                        <button 
                          className="complete-btn highlight" 
                          onClick={() => {
                            const otherUser = selectedChat.participants.find((p) => p._id !== authUser?._id);
                            const tradeId = selectedChat.tradeId?._id || selectedChat.tradeId;
                            
                            navigate("/feedback", {
                              state: { 
                                tradeId, 
                                reviewedUser: otherUser?._id,
                                reviewedUserName: otherUser?.name
                              },
                            });
                          }}
                        >
                          Rate Trade
                        </button>
                      ) : isTradeFinalized ? (
                        /* Step 2: Show Finalize if accepted but not completed */
                        <button 
                          className="complete-btn highlight" 
                          onClick={() => {
                            const tradeId = selectedChat.tradeId?._id || selectedChat.tradeId;
                            completeTrade(tradeId);
                          }}
                        >
                          Finalize Trade
                        </button>
                      ) : (
                        /* Step 3: Default */
                        <button className="complete-btn" onClick={handleTradeProposal}>
                          Complete Trade
                        </button>
                      )}
                      
                      <IoCallSharp style={{ marginBottom: "-0.15rem" }} className="call-btn" />
                    </div>
                    </div>

                    <div className="chat-messages-scroll">
                    {liveMessages?.length > 0 ? (
                        <>
                        <p className="convo-divider">CONVERSATION STARTED</p>
                        {liveMessages.map((msg, idx) => {
                            const isSentByMe = msg.sender?._id === authUser?._id || msg.sender === authUser?._id;
                            // ✅ RENDER TRADE PROPOSAL CARD
                            // ✅ RENDER TRADE PROPOSAL CARD
                            if (msg.isTradeProposal) {
                            // 1. Get the Trade ID (Check message first, then fallback to chat object)
                            const tradeId = msg.tradeId?._id || msg.tradeId || selectedChat.tradeId?._id || selectedChat.tradeId;
                            const otherUser = selectedChat.participants.find((p) => p._id !== authUser?._id);
                            const isDone = msg.tradeStatus === "accepted" || msg.tradeStatus === "completed";
                            
                            // 2. Determine the Label
                            const cardTitle = isSentByMe ? "Your Trade Request" : "Trade Completion Request";
                            const cardDescription = isSentByMe 
                              ? `You proposed to finalize this exchange.` 
                              : `${otherUser?.name} proposed to finalize this exchange.`;

                            return (
                              <div key={idx} className={`message-row ${isSentByMe ? "sent" : "received"}`}>
                                <img src={msg.sender?.profileImg || defaultImg} className="msg-avatar" alt="" />
                                <div className="trade-proposal-card">
                                  <h4>{cardTitle}</h4>
                                  
                                  {/* Update: Show "Completed" text if status is accepted OR completed */}
                                  <p>{isDone ? "✅ This trade is completed!" : cardDescription}</p>

                                  {msg.tradeStatus === "pending" && (
                                    isSentByMe ? (
                                      <span className="status-note pending">Waiting for approval...</span>
                                    ) : (
                                      <div className="trade-card-actions">
                                        <button
                                          className="accept-btn"
                                          onClick={() => {
                                            socket.emit("respondToTrade", {
                                              chatId: selectedChat._id,
                                              messageId: msg._id, 
                                              action: "accept"
                                            });
                                          }}
                                        >
                                          Accept
                                        </button>
                                        <button 
                                          className="reject-btn"
                                          onClick={() => socket.emit("respondToTrade", { chatId: selectedChat._id, messageId: msg._id, action: "reject" })}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    )
                                  )}

                                  {msg.tradeStatus === "rejected" && (
                                    <div className="status-badge-rejected">❌ Declined</div>
                                  )}
                                </div>
                              </div>
                            );
                          }
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
