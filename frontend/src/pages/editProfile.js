import React, { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { baseURL } from '../constants/baseUrl';
import { defaultImg } from '../constants/defaultImg'; // Use your constant

function EditProfile({ authUser }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [customSkillOffered, setCustomSkillOffered] = useState("");
  const [customSkillWanted, setCustomSkillWanted] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    about: "",
    profileImg: "",
    skillsOffered: [],
    skillsWanted: [],
  });

  // CRITICAL: Sync local state when authUser data is loaded/updated
  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        address: authUser.address || "",
        about: authUser.about || "",
        profileImg: authUser.profileImg || "",
        skillsOffered: authUser.skillsOffered || [],
        skillsWanted: authUser.skillsWanted || [],
      });
    }
  }, [authUser]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (updatedData) => {
      const res = await fetch(`${baseURL}/api/auth/profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");
      return data;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      // This refreshes the global authUser data across the whole app
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => toast.error(err.message),
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFormData((prev) => ({ ...prev, profileImg: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSkillChange = (e, category) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value] 
        : prev[category].filter((skill) => skill !== value),
    }));
  };

  const addCustomSkill = (category, value) => {
    if (!value.trim()) return;
    if (!formData[category].includes(value)) {
      setFormData((prev) => ({ ...prev, [category]: [...prev[category], value] }));
    }
    category === "skillsOffered" ? setCustomSkillOffered("") : setCustomSkillWanted("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  return (
    <div className="signup-second-part-page edit-profile-page" style={{paddingTop:"5.3rem"}}>
      <div className="signup-second-part-wrapper">
        <div className="signup-name-cont">
          <h3 className="signup-name-h3">Edit Your Profile</h3>
          <p className="signup-name-p">Update your information and skills</p>

          <form onSubmit={handleSubmit}>
            <div className="profile-main-layout">
              <div className="profile-image-uploader">
                <div className="avatar-wrapper" onClick={() => fileInputRef.current.click()}>
                  <img 
                    src={formData.profileImg || defaultImg} 
                    alt="Profile" 
                    className="avatar-preview"
                  />
                  <div className="edit-overlay" style={{marginTop:"1rem"}}>Change Photo</div>
                </div>
                <input 
                  type="file" accept="image/*" ref={fileInputRef}
                  onChange={handleImageChange} style={{ display: "none" }} 
                />
              </div>

              <div className="signup-name-right-content"> 
                <div className="signup-name-row-input">
                  <div className="label-input-col"> 
                    <label>Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="label-input-col"> 
                    <label>Address</label>
                    <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="label-input-col"> 
                  <label>About You</label>
                  <textarea name="about" value={formData.about} onChange={handleInputChange} />
                </div>

                {/* Skills Section (Same as your UI) */}
                {[ {label: "Skills I Offer", key: "skillsOffered", custom: customSkillOffered, setCustom: setCustomSkillOffered},
                   {label: "Skills I Want", key: "skillsWanted", custom: customSkillWanted, setCustom: setCustomSkillWanted}
                ].map((section) => (
                  <div className="label-input-col" key={section.key}> 
                    <label className={section.key === "skillsOffered" ? "skill-offer" : "skill-want"}>{section.label}</label>
                    <div className="skills-selection-grid">
                      {["UI Designer", "Figma", "React", "Blender"].map((skill) => (
                        <label key={skill} className={`skill-chip ${formData[section.key].includes(skill) ? "active" : ""}`}>
                          <input
                            type="checkbox" value={skill}
                            checked={formData[section.key].includes(skill)}
                            onChange={(e) => handleSkillChange(e, section.key)}
                            style={{ display: "none" }}
                          />
                          {skill}
                        </label>
                      ))}
                      
                      {/* Render any skills that aren't in the default list */}
                      {formData[section.key]
                        .filter(s => !["UI Designer", "Figma", "React", "Blender"].includes(s))
                        .map(skill => (
                          <label key={skill} className="skill-chip active">
                            <input
                              type="checkbox" value={skill} checked={true}
                              onChange={(e) => handleSkillChange(e, section.key)}
                              style={{ display: "none" }}
                            />
                            {skill}
                          </label>
                        ))}

                      <div className="custom-skill-action">
                        <input
                          type="text" placeholder="+ Custom" value={section.custom}
                          onChange={(e) => section.setCustom(e.target.value)}
                        />
                        <button type="button" onClick={() => addCustomSkill(section.key, section.custom)}>Add</button>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="create-profile-btn-container">
                  <button type="submit" className="submit-profile-btn" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;