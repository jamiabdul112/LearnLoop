import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        console.log("--- MIDDLEWARE START ---");
        console.log("Token from cookie:", token ? "Found" : "NOT Found");

        // Error #1
        if (!token) {
            console.log("Triggered Error #1");
            return res.status(401).json({ error: "Error #1: No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Error #2
        if (!decoded) {
            console.log("Triggered Error #2");
            return res.status(401).json({ error: "Error #2: Invalid Token" });
        }
        
        const user = await User.findById(decoded.userId).select("-password");

        // Error #3
        if (!user) {
            console.log("Triggered Error #3");
            return res.status(401).json({ error: "Error #3: User not found" });
        }

        console.log("--- SUCCESS: Proceeding to Controller ---");
        req.user = user;
        next();
    } catch (error) {
        console.log("--- CATCH BLOCK TRIGGERED ---");
        console.log("Message:", error.message);
        
        // Error #4
        return res.status(500).json({ 
            error: "Error #4: Catch Block", 
            details: error.message 
        });
    }
};

export default protectRoute;