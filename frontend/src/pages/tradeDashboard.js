import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import { defaultImg } from "../constants/defaultImg";
import { MdChatBubble } from "react-icons/md";
import '../css/tradeDashboard.css'
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom";

function TradeDashboard() {

    const queryClient = useQueryClient(); 
    const authUser = queryClient.getQueryData(["authUser"]);
    const navigate = useNavigate();

  // ✅ Fetch incoming trades (received requests)
  const { data: incoming, isLoading: loadingIncoming } = useQuery({
    queryKey: ["incomingTrades"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/trades/incoming`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch incoming trades");
      return data;
    },
  });

  // ✅ Fetch approved trades (both sent and received)
  const { data: approved, isLoading: loadingApproved } = useQuery({
    queryKey: ["approvedTrades"],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/trades/my-trades`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch approved trades");
      return data;
    },
  });

  const { mutate: respondTrade } = useMutation({
    mutationFn: async ({ id, status, fromUserId }) => {
      // Step 1: Respond to trade
      const res = await fetch(`${baseURL}/api/trades/respond/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to respond to trade");

      // Step 2: If accepted, create chat room
      if (status === "accepted") {
        const chatRes = await fetch(`${baseURL}/api/chats/create-chat`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            participants: [authUser._id, fromUserId] ,
            tradeId: id
          }),
        });
        const chatData = await chatRes.json();
        if (!chatRes.ok) throw new Error(chatData.error || chatData.message || "Failed to create chat");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["incomingTrades"]);
      queryClient.invalidateQueries(["approvedTrades"]);
      queryClient.invalidateQueries(["userChats"]); // refresh chat list
    },
  });

  

  
  if (loadingIncoming || loadingApproved) {
    return (
      <div style={{ display: "flex", justifyContent: "center", marginTop: "10rem" }}>
        <SvgSpinner size={36} stroke={4} />
      </div>
    );
  }

  return (
    <div className="tradeDashboard-page">
        <div className="tradeDashboard-wrapper">
            
            {/* Page Header */}
            <div className="tradeDashboard-header">
            <h1 className="page-title">Trade Requests and Matches</h1>
            <p className="page-subtitle">Manage your incoming barter proposals and active skill exchanges.</p>
            </div>

            <div className="tradeDashboard-content">
            
            {/* LEFT COLUMN: RECEIVED REQUESTS */}
            <div className="tradeRequest-wrapper">
                <div className="section-header-flex">
                <h2 className="column-title">RECEIVED REQUESTS</h2>
                <span className="count-badge">{incoming?.length || 0} NEW</span>
                </div>

                <div className="trade-list">
                {incoming?.length > 0 ? (
                    incoming.map((trade) => (
                    <div key={trade._id} className="tradeRequest-card">
                        <div className="card-header">
                        <img
                            src={trade.fromUser?.profileImg || defaultImg}
                            alt="profile"
                            className="user-avatar"
                        />
                        <div className="user-meta">
                            <p className="user-name">{trade.fromUser?.name}</p>
                            <p className="trade-subject">Offers {trade.skillOffered?.title}</p>
                        </div>
                        </div>
                        
                        <div className="card-body">
                        <p className="request-message">
                            "I'd love to trade my {trade.skillOffered?.title} for your {trade.skillWanted?.title}. Let me know if you're interested!"
                        </p>
                        </div>

                        <div className="card-actions">
                        <button
                          className="accept-btn"
                          onClick={() =>
                            respondTrade({ id: trade._id, status: "accepted", fromUserId: trade.fromUser._id })
                          }
                        >
                          Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() =>
                            respondTrade({ id: trade._id, status: "rejected", fromUserId: trade.fromUser._id })
                          }
                        >
                          Reject
                        </button>

                        </div>
                    </div>
                    ))
                ) : (
                    <p className="empty-state">No requests received yet.</p>
                )}
                </div>
            </div>

            {/* RIGHT COLUMN: ACCEPTED TRADERS */}
            <div className="tradeAccepted-wrapper">
                <h2 className="column-title">ACCEPTED TRADERS</h2>
                
                <div className="trade-list">
                {/* Mapping through both Sent and Received approved trades */}
                {[...(approved?.approvedReceived || []), ...(approved?.approvedSent || [])].length > 0 ? (
                    [...(approved?.approvedReceived || []), ...(approved?.approvedSent || [])].map((trade) => {
                    const otherUser = trade.fromUser?._id === authUser?._id ? trade.toUser : trade.fromUser;
                    return (
                        <div key={trade._id} className="tradeAccepted-card">
                        <div className="card-content-flex">
                            <img
                            src={otherUser?.profileImg || defaultImg}
                            alt="profile"
                            className="small-avatar"
                            />
                            <div className="user-meta">
                            <p className="user-name">{otherUser?.name}</p>
                            <p className="trade-status">
                                Trading {trade.skillOffered?.title} for {trade.skillWanted?.title}
                            </p>
                            </div>
                            <button className="chat-icon-btn" onClick={() => navigate("/chat")}>
                            <MdChatBubble />
                            </button>
                        </div>
                        </div>
                    );
                    })
                ) : (
                    <p className="empty-state">No accepted traders yet.</p>
                )}
                </div>
            </div>

            </div>
        </div>
        </div>
  );
}

export default TradeDashboard;
