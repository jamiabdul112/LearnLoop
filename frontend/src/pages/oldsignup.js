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
        <div className="signup-frst-page">
        <div className="signup-frst-wrapper">
        <div className="signup-frst-page-content">
        <div className="left-signup-content">
            <h2 className="white-h2">Swap Talent.</h2>
            <h2 className="green-h2">Grow Together.</h2>
            <p className="signup-p-1">Join a community where talents are shared, not sold. Whether you’re teaching, learning, or simply exploring, every swap helps you grow, connect, and discover new possibilities together.</p>
            <img src="/images/signup-pg.png" alt="Signup Page Image"></img>
        </div>
        <div className="right-signup-content">
        <div className="signup-email">
            <h3 className="signup-email-h3">Create your profile</h3>
            <p className="signup-email-p">Join our community and starts swapping</p>
        <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            type="password"
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Create Account</button>

        </form>
        <p className="signup-email-p2">Already have an account?<Link to="/login" style={{textDecoration:"none"}}><span className="sign-in-shortcut">Sign In</span></Link></p>
        </div>
        </div>
        </div>
        </div>
        </div>
      )}

      {step === 2 && (
        <div className="signup-second-page">
        <div className="signup-second-wrapper">
        <div className="signup-name-cont">
            <h3 className="signup-name-h3">Create your profile</h3>
            <p className="signup-name-p">Join our community and starts swapping</p>
            
        <form onSubmit={handleSubmit}>
          {/* Profile Image Uploader */}
          <div className="profile-image-uploader">
            <div 
                className="avatar-wrapper" 
                onClick={() => fileInputRef.current.click()} // Trigger hidden input
            >
                {/* Show uploaded preview OR the placeholder if empty */}
                <img 
                src={formData.profileImg || "/images/edit-placeholder.png"} 
                alt="Profile Preview" 
                className="avatar-preview"
                />
                
                
            </div>
            <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef}
                onChange={handleImageChange} 
                style={{ display: "none" }} 
            />
          </div>

          <div className="signup-name-right-content">  
           <div className="signup-name-row-input">
            <div className="label-input-col"> 
            <label>Name</label>
          <input
            type="text"
            placeholder="Full Name"
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
            placeholder="Address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
          />
          </div>
          </div>
          <div className="label-input-col"> 
            <label>About You</label>
          <textarea
            placeholder="About you"
            name="about"
            value={formData.about}
            onChange={handleInputChange}
          />
          </div>
           <div className="label-input-col"> 
          <label>Skills I Offer</label>
          {["Cooking", "Teaching"].map((skill) => (
            <label key={skill}>
              <input
                type="checkbox"
                value={skill}
                checked={formData.skillsOffered.includes(skill)}
                onChange={(e) => handleSkillChange(e, "skillsOffered")}
              />
              {skill}
            </label>
          ))}
          
          {formData.skillsOffered
            .filter((s) => !["Cooking", "Teaching"].includes(s))
            .map((skill) => (
              <label key={skill}>
                <input
                  type="checkbox"
                  value={skill}
                  checked={true}
                  onChange={(e) => handleSkillChange(e, "skillsOffered")}
                />
                {skill}
              </label>
            ))}

          <div>
            <input
              type="text"
              placeholder="Other skill"
              value={customSkillOffered}
              onChange={(e) => setCustomSkillOffered(e.target.value)}
            />
            <button type="button" onClick={() => addCustomSkill("skillsOffered", customSkillOffered)}>
              Add
            </button>
          </div>
          </div>
            <div className="label-input-col"> 
          <label>Skills I Want</label>
          {["Music", "Coding"].map((skill) => (
            <label key={skill}>
              <input
                type="checkbox"
                value={skill}
                checked={formData.skillsWanted.includes(skill)}
                onChange={(e) => handleSkillChange(e, "skillsWanted")}
              />
              {skill}
            </label>
          ))}

          {formData.skillsWanted
            .filter((s) => !["Music", "Coding"].includes(s))
            .map((skill) => (
              <label key={skill}>
                <input
                  type="checkbox"
                  value={skill}
                  checked={true}
                  onChange={(e) => handleSkillChange(e, "skillsWanted")}
                />
                {skill}
              </label>
            ))}

          <div>
            <input
              type="text"
              placeholder="Other skill"
              value={customSkillWanted}
              onChange={(e) => setCustomSkillWanted(e.target.value)}
            />
            <button type="button" onClick={() => addCustomSkill("skillsWanted", customSkillWanted)}>
              Add
            </button>
          </div>
          </div>
          <div className="create-profile-btn">
          <button type="submit">{isPending ? "Loading..." : "Create Profile"}</button>
          {isError && <p style={{ color: "red" }}>{error.message}</p>}
          <p className="create-profile-p-1">have an account?<Link to="/login" style={{textDecoration:"none"}}><span className="green-txt">Sign In</span></Link></p>
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