import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: true 
    },
    category: {
    type: String,
    enum: [
        "technology",
        "design",
        "music",
        "performing_arts",
        "language",
        "business",
        "science",
        "health_fitness"
    ],
    required: true,
    },

    description: { 
        type: String, 
        required: true 
    },
    skillOffered: { 
        type: String, 
        required: true 
    }, 
    skillWanted: { 
        type: String, 
        required: true 
    },
    owner: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
  },
  { timestamps: true }
);

const Skill = mongoose.model("Skill", skillSchema);
export default Skill;
