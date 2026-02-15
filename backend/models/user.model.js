import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    profileImg: { 
        type: String
     }, // Cloudinary URL
    address: { 
        type: String 
    },
    about: { 
        type: String 
    },
    skillsOffered: [
        { 
            type: String 
        }
    ], // or ObjectId ref if you want Skill model
    skillsWanted: [
        {
            type: String 
        }
    ],
    reviews: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Review" 
        }
    ],
    chats: [
        { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Chat" 
        }
    ],
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
export default User;
