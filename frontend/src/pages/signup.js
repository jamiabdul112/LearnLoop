import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { baseURL } from "../constants/baseUrl";
import {  useRef } from "react";
import '../css/signup.css'
import { Link } from "react-router-dom";

function SignUp() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    about: "",
    address: "",
    profileImg: "", // Added profileImg to state
    skillsOffered: [],
    skillsWanted: [],
  });

  const fileInputRef = useRef(null);

  const [customSkillOffered, setCustomSkillOffered] = useState("");
  const [customSkillWanted, setCustomSkillWanted] = useState("");

  const { mutate: signup, isPending, isError, error } = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${baseURL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
    },
    onSuccess: () => {
      toast.success("User Created Successfully");
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert image to Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImg: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSkillChange = (e, type) => {
    const { value, checked } = e.target;
    setFormData((prev) => {
      const updated = checked
        ? [...prev[type], value]
        : prev[type].filter((skill) => skill !== value);
      return { ...prev, [type]: updated };
    });
  };

  const addCustomSkill = (type, skill) => {
    if (skill.trim() && !formData[type].includes(skill.trim())) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], skill.trim()],
      }));
      if (type === "skillsOffered") setCustomSkillOffered("");
      if (type === "skillsWanted") setCustomSkillWanted("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
  };

  return (
    <div className="signup-page">
    <div className="signup-wrapper">
        
      {step === 1 && (
      <div className="signupPage-page">
        <div className="signupPage-wrapper">
          
          {/* LEFT COLUMN: Branding & Illustration */}
          <div className="signupPage-branding">
            <div className="branding-content">
              <h1 className="hero-text-white">Swap Talent.</h1>
              <h1 className="hero-text-green">Grow Together.</h1>
              <p className="hero-description">
                Join a community where talents are shared, not sold. Whether you’re teaching, 
                learning, or simply exploring, every swap helps you grow, connect, and 
                discover new possibilities together.
              </p>
              <div className="illustration-container">
                {/* This represents the cards and connection icon in your image */}
                <img src="/images/signup-pg.png" alt="Barter Connection Illustration" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Auth Form */}
          <div className="signupPage-form-container">
            <div className="form-content-box">
              <div className="form-header">
                <h2 className="form-title">Create your profile</h2>
                <p className="form-subtitle">Join our community and starts swapping</p>
              </div>

              <form className="signup-form" onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
                <div className="input-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    placeholder="abcd@gmail.com"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="input-group">
                  <label htmlFor="password">Create Password</label>
                  <input
                    type="password"
                    placeholder="***************"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <button type="submit" className="submit-auth-btn">
                  Create Account
                </button>
              </form>

              <p className="auth-footer-text">
                Already have an account? 
                <Link to="/login" className="auth-link"> Sign In</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    )}
    {step === 2 && (
    <div className="signup-second-part-page">
      <div className="signup-second-part-wrapper">
        <div className="signup-name-cont">
          {/* Header Section */}
          <h3 className="signup-name-h3">Lets Build Your Profile</h3>
          <p className="signup-name-p">Introduce yourself to our community</p>

          <form onSubmit={handleSubmit}>
            <div className="profile-main-layout">
              
              {/* LEFT: Profile Image Section */}
              <div className="profile-image-uploader">
                <div 
                  className="avatar-wrapper" 
                  onClick={() => fileInputRef.current.click()} 
                >
                  <img 
                    src={formData.profileImg || "/images/edit-placeholder.png"} 
                    alt="Profile Preview" 
                    className="avatar-preview"
                  />
                  {/* Visual edit indicator from screenshot */}
                  
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  onChange={handleImageChange} 
                  style={{ display: "none" }} 
                />
              </div>

              {/* RIGHT: Form Content */}
              <div className="signup-name-right-content"> 
                
                {/* Name and Address Row */}
                <div className="signup-name-row-input">
                  <div className="label-input-col"> 
                    <label>Name</label>
                    <input
                      type="text"
                      placeholder="Ryan Gosling"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="label-input-col"> 
                    <label>Address</label>
                    <input
                      type="text"
                      placeholder="San Francisco, 10th street"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                {/* About Section */}
                <div className="label-input-col"> 
                  <label>About You</label>
                  <textarea
                    placeholder="Im a project designer...."
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Skills I Offer (Checkbox List) */}
                <div className="label-input-col"> 
                  <label className="skill-offer">Skills I Offer</label>
                  <div className="skills-selection-grid">
                    {["UI Designer", "Figma", "React", "Blender"].map((skill) => (
                      <label key={skill} className={`skill-chip ${formData.skillsOffered.includes(skill) ? "active" : ""}`}>
                        <input
                          type="checkbox"
                          value={skill}
                          checked={formData.skillsOffered.includes(skill)}
                          onChange={(e) => handleSkillChange(e, "skillsOffered")}
                          style={{ display: "none" }}
                        />
                        {skill}
                      </label>
                    ))}
                    
                    {/* Custom Skills Added for Offer */}
                    {formData.skillsOffered
                      .filter((s) => !["UI Designer", "Figma", "React", "Blender"].includes(s))
                      .map((skill) => (
                        <label key={skill} className="skill-chip active">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={true}
                            onChange={(e) => handleSkillChange(e, "skillsOffered")}
                            style={{ display: "none" }}
                          />
                          {skill}
                        </label>
                      ))}

                    <div className="custom-skill-action">
                      <input
                        type="text"
                        placeholder="+  Custom"
                        value={customSkillOffered}
                        onChange={(e) => setCustomSkillOffered(e.target.value)}
                      />
                      <button type="button" onClick={() => addCustomSkill("skillsOffered", customSkillOffered)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Skills I Want (Checkbox List) */}
                <div className="label-input-col"> 
                  <label className="skill-want">Skills I Want</label>
                  <div className="skills-selection-grid">
                    {["UI Designer", "Figma", "React", "Blender"].map((skill) => (
                      <label key={skill} className={`skill-chip ${formData.skillsWanted.includes(skill) ? "active" : ""}`}>
                        <input
                          type="checkbox"
                          value={skill}
                          checked={formData.skillsWanted.includes(skill)}
                          onChange={(e) => handleSkillChange(e, "skillsWanted")}
                          style={{ display: "none" }}
                        />
                        {skill}
                      </label>
                    ))}

                    {/* Custom Skills Added for Want */}
                    {formData.skillsWanted
                      .filter((s) => !["UI Designer", "Figma", "React", "Blender"].includes(s))
                      .map((skill) => (
                        <label key={skill} className="skill-chip active">
                          <input
                            type="checkbox"
                            value={skill}
                            checked={true}
                            onChange={(e) => handleSkillChange(e, "skillsWanted")}
                            style={{ display: "none" }}
                          />
                          {skill}
                        </label>
                      ))}

                    <div className="custom-skill-action">
                      <input
                        type="text"
                        placeholder="+  Custom"
                        value={customSkillWanted}
                        onChange={(e) => setCustomSkillWanted(e.target.value)}
                      />
                      <button type="button" onClick={() => addCustomSkill("skillsWanted", customSkillWanted)}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit and Footer */}
                <div className="create-profile-btn-container">
                  <button type="submit" className="submit-profile-btn">
                    {isPending ? "Loading..." : "Create Profile"}
                  </button>
                  {isError && <p className="error-text">{error.message}</p>}
                  <p className="create-profile-p-1">
                    Already have an account? <Link to="/login" className="green-txt">Sign In</Link>
                  </p>
                </div>

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )}
    </div>
    </div>

  );
}

export default SignUp;