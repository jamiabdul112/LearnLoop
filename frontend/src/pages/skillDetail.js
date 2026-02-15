import React from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import SvgSpinner from "../utils/svgSpinner";
import { defaultImg } from "../constants/defaultImg";
import "../css/skillDetail.css";
import toast from "react-hot-toast";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

function SkillDetail({authUser}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedMySkillId, setSelectedMySkillId] = useState("");

  // 1. Fetch Skill Details
  const {
    data: skill,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["skill", id],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/skills/${id}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch skill");
      return data;
    },
  });

  const { data: mySkills} = useQuery({
    queryKey: ["mySkills", authUser?._id],
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/skills/user/${authUser._id}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) return []; // Return empty if none found
      return data;
    },
    enabled: !!authUser?._id, // Only run if user is logged in
  });

  // 2. Trade Request Mutation
  const { mutate: sendTrade, isPending } = useMutation({
    mutationFn: async (tradeData) => {
      const res = await fetch(`${baseURL}/api/trades/send-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tradeData),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send request");
      return data;
    },
    onSuccess: () => {
      toast.success("Trade request sent! Wait for their response.");
      setSelectedMySkillId("");// Refresh any trade lists
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const { mutate: deleteSkillMutation, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/api/skills/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete skill");
      return data;
    },
    onSuccess: () => {
      toast.success("Skill deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["skills"] }); // Refresh main list
      navigate("/"); // Redirect to home
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this skill listing?")) {
      deleteSkillMutation();
    }
  }

  const handleRequestTrade = () => {
    if (skill.owner._id === authUser._id) {
    return toast.error("You cannot send a trade request to your own listing!");
    }
    if (!selectedMySkillId) {
      return toast.error("Please select one of your skills to offer!");
    }

    const tradeData = {
      toUser: skill.owner._id,
      skillWanted: skill._id, 
      skillOffered: selectedMySkillId, // THE SELECTED ID FROM DROPDOWN
    };

    sendTrade(tradeData);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem", marginTop: "5rem" }}>
        <SvgSpinner size={36} stroke={4} />
      </div>
    );
  }

  if (isError) return <p style={{ color: "red", textAlign: "center", marginTop: "5rem" }}>{error.message}</p>;
  if (!skill) return <p style={{ textAlign: "center", marginTop: "5rem" }}>Skill not found</p>;
  const isOwner = authUser?._id === skill.owner?._id;
  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        
        {/* LEFT COLUMN */}
        <div className="profile-main-content">
          <div className="profile-header">
            <div className="profile-avatar-container">
              <img src={skill.owner?.profileImg || defaultImg} alt="profile" className="profile-avatar" />
            </div>
            <div className="profile-intro">
              <h1 className="profile-name">{skill.owner?.name}</h1>
              <p className="profile-headline">{skill.title}</p>
              <p className="profile-location">
                <span className="pin-icon">📍</span> {skill.owner?.address}
              </p>
              {isOwner && (
              <button 
                onClick={handleDelete} 
                className="delete-skill-btn"
                disabled={isDeleting}
                
              >
                {isDeleting ? "Deleting..." : "Delete Listing"}
              </button>
              )}
            </div>
          </div>

          <div className="content-section">
            <h3 className="section-title">About Me</h3>
            <p className="section-text">{skill.owner?.about || "No bio available."}</p>
          </div>

          <div className="content-section">
            <h3 className="section-title">Skills and Expertise</h3>
            <div className="skills-split-grid">
              <div className="skills-column">
                <h4 className="column-label">CAN TEACH</h4>
                <div className="tag-container">
                  {skill.owner?.skillsOffered?.map((s, i) => (
                    <span key={i} className="skill-tag offered">{s}</span>
                  ))}
                </div>
              </div>
              <div className="skills-column">
                <h4 className="column-label">WANTS TO LEARN</h4>
                <div className="tag-container">
                  {skill.owner?.skillsWanted?.map((s, i) => (
                    <span key={i} className="skill-tag wanted">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="content-section">
            <div className="section-header-flex">
              <h3 className="section-title">Recent Reviews</h3>
              <span className="view-all-link">View all {skill.owner?.reviews?.length || 0} Reviews</span>
            </div>
            <div className="reviews-list">
              {skill.owner?.reviews?.length > 0 ? (
                skill.owner.reviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-user-info">
                      <img src={review.reviewer?.profileImg || defaultImg} className="reviewer-avatar" alt="reviewer" />
                      <div className="reviewer-details">
                        <p className="reviewer-name">{review.reviewer?.name || "Anonymous"}</p>
                        <p className="review-topic">{review.tradeId?.skillOffered?.title} ↔ {review.tradeId?.skillWanted?.title}</p>
                      </div>
                      <div className="review-stars">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={i < review.rating ? "star-filled" : "star-empty"}>★</span>
                        ))}
                      </div>
                    </div>
                    <div className="review-content">
                      <p className="review-feedback">"{review.feedback}"</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-reviews">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-card action-card">
            <h3 className="card-title">Interested in Trade?</h3>
            <p className="card-subtitle">Users typically respond faster for new requests</p>
            
            <div style={{ margin: "15px 0" }}>
              <label style={{ fontSize: "12px", color: "#666" }}>Choose what you offer:</label>
              <select 
                className="main-input"
                style={{ width: "100%", padding: "8px", borderRadius: "5px", marginTop: "15px" }}
                value={selectedMySkillId}
                onChange={(e) => setSelectedMySkillId(e.target.value)}
              >
                <option value="">-- Select Your Skill --</option>
                {mySkills?.map((mySkill) => (
                  <option key={mySkill._id} value={mySkill._id}>
                    {mySkill.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="request-trade-btn"
              onClick={handleRequestTrade}
              disabled={isPending}
            >
              {isPending ? "Sending Request..." : "Request Trade"}
            </button>
          </div>

          <div className="sidebar-card info-card">
            <h3 className="card-title">TYPICAL AVAILABILITY</h3>
            <p className="card-subtitle">Available on weekends and weekdays after 6PM!</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SkillDetail;