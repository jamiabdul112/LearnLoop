import Skill from "../models/skill.model.js";

// @desc Create a new skill
// @route POST /api/skills
// @access Private

export const createSkill = async (req, res) => {
  try {
    const { title, category, description, skillOffered, skillWanted } = req.body;

    if (!title || !category || !description || !skillOffered || !skillWanted) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const skill = await Skill.create({
      title,
      category,
      description,
      skillOffered,   
      skillWanted,    
      owner: req.user._id,
    });

    res.status(201).json({
      message: "Skill created successfully",
      skill,
    });
  } catch (error) {
    console.error("createSkill error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Get skills by category
// @route GET /api/skills?category=music
// @access Public

export const getSkillsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category && category !== "all") {
      filter.category = category;
    }

    const skills = await Skill.find(filter).populate("owner", "name email profileImg address skillsWanted").sort({ createdAt: -1 });

    res.status(200).json(skills);
  } catch (error) {
    console.error("getSkillsByCategory error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Get skill details
// @route GET /api/skills/:id
// @access Public

export const getSkillDetails = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate({
        path: "owner",
        select: "name address profileImg about skillsOffered skillsWanted",
        populate: {
          path: "reviews",
          select: "rating feedback reviewer createdAt tradeId",
          populate: [
            { path: "reviewer", select: "name profileImg" },
            { 
              path: "tradeId", 
              populate: [
                { path: "skillOffered", select: "title" }, 
                { path: "skillWanted", select: "title" }
              ]
            }
          ]
        }
      })
      





    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    res.status(200).json(skill);
  } catch (error) {
    console.error("getSkillDetails error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// @desc Delete a skill
// @route DELETE /api/skills/:id
// @access Private (only owner can delete)

export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: "Skill not found" });
    }

    // ✅ Check ownership
    if (skill.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this skill" });
    }

    await skill.deleteOne();

    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error("deleteSkill error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getUserSkills = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Find all skills where owner matches the user id
    const skills = await Skill.find({ owner: id }).populate("owner", "name profileImg address");

    if (!skills || skills.length === 0) {
      return res.status(404).json({ message: "No skills found for this user" });
    }

    res.status(200).json(skills);
  } catch (error) {
    console.error("getUserSkills error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
