import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { baseURL } from "../constants/baseUrl";
import { MdOutlineTaskAlt } from "react-icons/md";
import { useEffect } from "react";
import '../css/feedbackPage.css'

function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();


   

  // ✅ tradeId and reviewedUser passed via navigation state
  const { tradeId, reviewedUser, reviewedUserName } = location.state || {};

   useEffect(() => {
    if (!tradeId || !reviewedUser) {
        alert("No active trade found to review.");
        navigate("/dashboard");
    }
    }, [tradeId, reviewedUser, navigate]);

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");

  const { mutate: submitReview, isLoading } = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${baseURL}/api/reviews/add-review`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedUser, rating, feedback, tradeId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");
      return data;
    },
    onSuccess: () => {
      alert("Review submitted successfully!");
      navigate("/dashboard"); // or wherever you want to redirect
    },
    onError: (error) => {
      alert("Error: " + error.message);
    },
  });

  return (
    <div className="feedbackPage-page">
    <div className="feedbackPage-wrapper">

        {/* 1. Success Icon & Main Header */}
        <div className="feedback-header">
        <div className="success-icon-circle">
            <MdOutlineTaskAlt className="check-icon" />
        </div>
        <h1 className="main-title">Trade Completed</h1>
        <p className="sub-title">Your skill swap with {reviewedUserName} is finished. How did it go?</p>
        </div>

        {/* 2. Central Feedback Card */}
        <div className="feedbackPage-card">
        <h3 className="card-label" style={{marginBottom:'-0.1rem', marginTop:'-0.3rem'}}>Rate your experience</h3>

        {/* ⭐ Star Rating Container */}
        <div className="star-rating-group" style={{marginBottom:'1rem'}}>
            {[...Array(5)].map((_, index) => {
            const starValue = index + 1;
            return (
                <span
                key={starValue}
                className={`star-icon ${starValue <= (hover || rating) ? "filled" : "empty"}`}
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHover(starValue)}
                onMouseLeave={() => setHover(rating)}
                >
                ★
                </span>
            );
            })}
        </div>
        
        {/* 📝 Feedback Input Section */}
        <div className="input-group">
            <label className="input-label" style={{marginBottom:'-0.1rem'}}>Your Review</label>
            <textarea
            className="feedback-textarea"
            placeholder={`Share a few words about your swap with ${reviewedUserName}`}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            />
        </div>
        </div>

        {/* 3. Global Submit Action */}
        <div className="feedback-actions">
        <button
            className="submit-feedback-btn"
            onClick={() => submitReview()}
            disabled={isLoading || rating === 0 || !feedback.trim()}
        >
            {isLoading ? "Submitting..." : "Submit"}
        </button>
        </div>

    </div>
    </div>
  );
}

export default FeedbackPage;
