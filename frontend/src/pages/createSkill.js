import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseURL } from "../constants/baseUrl";
import toast from "react-hot-toast";
import '../css/createSkill.css'
import { useNavigate } from "react-router-dom";

function CreateSkill() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const authUser = queryClient.getQueryData(["authUser"]);
  

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillWanted, setSkillWanted] = useState("");

  // ✅ Mutation for creating skill
  const { mutate: createSkill, isPending } = useMutation({
    mutationFn: async (newSkill) => {
      const res = await fetch(`${baseURL}/api/skills`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSkill),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to create skill");
      return data;
    },
    onSuccess: () => {
        toast.success("Skill created successfully!") 
        queryClient.invalidateQueries(["mySkills", authUser._id]); 
        navigate("/");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createSkill({ title, category, description, skillOffered, skillWanted });
  };

  return (
    <div className="createskill-page">
        <div className="createskill-wrapper">
            
            {/* 1. Header & Navigation */}
            <div className="createskill-header">

            <h1 className="page-title">Create Skill Listing</h1>
            <p className="page-subtitle">Set up your profile to start bartering expertise with the community.</p>
            </div>

            <form onSubmit={handleSubmit} className="createskill-form">
            
            {/* 2. Listing Title */}
            <div className="form-section">
                <label className="input-label">Listing Title</label>
                <input 
                className="main-input"
                placeholder="e.g., UI Design & Prototyping"
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
                />
            </div>

            {/* 3. Category Selection (Pills) */}
            <div className="form-section">
                <label className="input-label">Category</label>
                <div className="pill-grid">
                    {[
                        { label: "Technology", value: "technology" },
                        { label: "Design & Creative Arts", value: "design" },
                        { label: "Music", value: "music" },
                        { label: "Performing Arts", value: "performing_arts" },
                        { label: "Language & Communication", value: "language" },
                        { label: "Business & Finance", value: "business" },
                        { label: "Science", value: "science" },
                        { label: "Health & Fitness", value: "health_fitness" },
                    ].map((cat) => (
                        <div
                        key={cat.value}
                        className={`pill-item ${category === cat.value ? "active" : ""}`}
                        onClick={() => setCategory(cat.value)}
                        >
                        {cat.label}
                        </div>
                    ))}
                    </div>

            </div>

            

            {/* 4. Description */}
            <div className="form-section">
                <label className="input-label">About your offering</label>
                <textarea 
                className="main-textarea"
                placeholder="Briefly describe what you're looking for in a trade..."
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
                />
            </div>

            {/* 5. Offered Skills (Pill Grid) */}
            <div className="form-section">
                <div className="section-header-row">
                <label className="input-label">Skills I Can Offer</label>
                <span className="badge available">AVAILABLE</span>
                </div>
                <div className="pill-grid">
                {authUser?.skillsOffered?.map((s, idx) => (
                    <div 
                    key={idx}
                    className={`pill-item outline ${skillOffered === s ? "selected" : ""}`}
                    onClick={() => setSkillOffered(s)}
                    >
                    {s}
                    </div>
                ))}
                </div>
            </div>

            {/* 6. Wanted Skills (Pill Grid) */}
            <div className="form-section">
                <div className="section-header-row">
                <label className="input-label">Skills I Want to Learn</label>
                <span className="badge interests">INTERESTS</span>
                </div>
                <div className="pill-grid">
                {authUser?.skillsWanted?.map((s, idx) => (
                    <div 
                    key={idx}
                    className={`pill-item outline ${skillWanted === s ? "selected" : ""}`}
                    onClick={() => setSkillWanted(s)}
                    >
                    {s}
                    </div>
                ))}
                </div>
            </div>

            {/* 7. Action Buttons */}
            <div className="form-actions">
                <button type="submit" className="submit-btn" disabled={isPending}>
                {isPending ? "Posting..." : "Post"}
                </button>
                <button type="button" className="cancel-btn">Cancel</button>
            </div>

            </form>
        </div>
        </div>
  );
}

export default CreateSkill;
