import User from "../models/user.model.js";
import generateToken from "../utils/generateToken.js";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

export const registerUser = async (req, res) => {
    try {
        let { name, email, password, profileImg, address, about, skillsOffered, skillsWanted } = req.body;

        if (!name || !email || !password || !address) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // --- CLOUDINARY UPLOAD LOGIC ---
        if (profileImg && profileImg.startsWith("data:image")) {
            console.log("DEBUG: Uploading profile image to Cloudinary during registration...");
            try {
                const uploadRes = await cloudinary.uploader.upload(profileImg);
                profileImg = uploadRes.secure_url;
            } catch (uploadErr) {
                console.error("Cloudinary Upload Error:", uploadErr);
                // Optional: Decide if you want to fail registration or just continue without an image
                profileImg = ""; 
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            profileImg: profileImg || "", // Use the URL from Cloudinary or empty string
            address,
            about,
            skillsOffered,
            skillsWanted,
        });

        await newUser.save();
        generateToken(newUser._id, res);

        // Convert to object to hide internal mongoose fields
        const userResponse = newUser.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: "User registered successfully",
            user: userResponse,
        });
    } catch (error) {
        console.error("Signup controller error:", error);
        res.status(500).json({ error: error.message || "Internal server error" });
    }
};
// @desc Login user
// @route POST /api/auth/login
export const loginUser = async (req, res) => {


  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

    if(!user || !isPasswordCorrect){
            return res.status(401).json({error : "Invalid username and password"})
    }


    generateToken(user._id, res)
        res.status(200).json({
            message: "Login successful", 
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              profileImg: user.profileImg,
              address: user.address,
              about: user.about,
              skillsOffered: user.skillsOffered,
              skillsWanted: user.skillsWanted,
              
            },
        });
    
  } catch (error) {
      console.error(`Login controller error, ${error}`)
      res.status(500).json({ message: "Internal server error" })
  }
};

// @desc Get user profile
// @route GET /api/auth/profile
// @access Private
export const getUserProfile = async (req, res) => {
  console.log("Reached getUserProfile Controller for user:", req.user._id);
  try {
    // TEMPORARILY remove .populate to see if it works
    const user = await User.findById(req.user._id).populate("reviews").populate("chats").populate("skillsOffered");;

    if (!user) {
       return res.status(404).json({ error: "User not found in DB" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log("Controller Error:", error.message);
    res.status(500).json({ error: error.message });
  }
};
// @desc Update user profile
// @route PUT /api/auth/profile
// @access Private

export const updateUserProfile = async (req, res) => {
    console.log("DEBUG: Entered updateUserProfile");

    try {
        const { name, email, address, about, skillsOffered, skillsWanted, profileImg } = req.body;
        const userId = req.user._id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (profileImg && profileImg.startsWith("data:image")) {
            console.log("DEBUG: Uploading to Cloudinary...");
            // Delete old image if it exists
            if (user.profileImg) {
                const publicId = user.profileImg.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId).catch(e => console.log("Cloudinary Delete Err:", e.message));
            }
            const uploadRes = await cloudinary.uploader.upload(profileImg);
            user.profileImg = uploadRes.secure_url;
        }

        // Update fields
        user.name = name || user.name;
        user.email = email || user.email;
        user.address = address || user.address;
        user.about = about || user.about;
        user.skillsOffered = skillsOffered || user.skillsOffered;
        user.skillsWanted = skillsWanted || user.skillsWanted;

        const updatedUser = await user.save();
        console.log("DEBUG: Update Successful!");

        // Use return to ensure the function stops here
        const userResponse = updatedUser.toObject();
        delete userResponse.password; // Extra safety: never send the password

        return res.status(200).json({
            message: "Profile updated successfully",
            user: userResponse
        });
  

    } catch (error) {
        console.error("ACTUAL ERROR:", error);
        // If it's a validation error (like duplicate email), this will show it
        return res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};