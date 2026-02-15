import React, { useState } from "react";
import { baseURL } from "../constants/baseUrl";
import { IoIosSearch } from "react-icons/io";
import '../css/home.css';
import { useQuery } from "@tanstack/react-query";
import SvgSpinner from "../utils/svgSpinner";
import { Link } from "react-router-dom";

function Home() {
  const [feedType, setFeedType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Added default empty array [] to data: skills to prevent .filter() error
  const {
    data: skills = [], 
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["skills", feedType], 
    queryFn: async () => {
      const res = await fetch(`${baseURL}/api/skills?category=${feedType}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to fetch skills");
      }
      return data;
    },
  });

  // 2. Added optional chaining skill.title?. to prevent crash if a skill lacks a title
  const filteredSkills = skills.filter((skill) =>
    skill.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    skill.skillOffered?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. Early return ONLY for Loading and Error (Keeps logic clean)
  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "2rem", marginTop: "10rem" }}>
        <SvgSpinner size={36} stroke={4} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: "center", marginTop: "5rem", color: "red" }}>
        <p>Error: {error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="homepage">
      <div className="homepage-wrapper">
        
        {/* 1. Hero Section */}
        <div className="home-hero">
          <h1 className="hero-title">Explore the Community</h1>
          <p className="hero-subtitle">Find neighbors to trade skills with. No money, just talent.</p>
        </div>

        {/* 2. Search Section */}
        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon"><IoIosSearch /></span>
            <input
              type="text"
              placeholder='Search for "Piano Lesson", "React" etc'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* 3. Category Tabs */}
        <div className="home-category-container">
        <div className="home-category-list">
          {[
            { label: "All Skills", value: "all" },
            { label: "Tech", value: "technology" },
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
              className={`category-item ${feedType === cat.value ? "active" : ""}`}
              onClick={() => setFeedType(cat.value)}
            >
              {cat.label}
            </div>
          ))}
        </div>
      </div>


        {/* 4. Skills Grid - Handles the "No Results" state without breaking the page */}
        
        <div className="skills-grid">
          {filteredSkills.length > 0 ? (
            filteredSkills.map((skill) => (
              
              <Link
                key={skill._id}
                to={`/skills/${skill._id}`}
                className="skill-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                
                {/* Card Image Wrapper */}
                <div className="card-image-wrapper">
                  <img
                    src={skill.owner?.profileImg || "https://static.vecteezy.com/system/resources/previews/048/910/778/non_2x/default-image-missing-placeholder-free-vector.jpg"}
                    alt="skill-thumbnail"
                    className="skill-thumbnail"
                  />
                </div>

                {/* Card Content */}
                <div className="card-details">
                  <h3 className="owner-name">{skill.owner?.name || "Unknown User"}</h3>
                  <p className="location-text">
                    <span className="pin-icon">📍</span> {skill.owner?.address || "Location"}
                  </p>

                  <div className="info-group">
                    <p className="label offering-label">OFFERING</p>
                    <p className="value">{skill.skillOffered}</p>
                  </div>

                  <div className="info-group">
                    <p className="label looking-label">LOOKING FOR</p>
                    <p className="value">{skill.skillWanted}</p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="no-results" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem" }}>
              <h3>No skills found in "{feedType}"</h3>
              <p>Try searching for something else or check another category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;