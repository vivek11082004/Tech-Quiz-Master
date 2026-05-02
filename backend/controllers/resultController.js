import Result from "../model/Result.js";
import User from "../model/User.js";
import { getAuth } from "@clerk/clerk-sdk-node";

//  Create a result
export const CreatemyResult = async (req, res) => {
    try{
        const { userId } = getAuth(req);
        if(!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        // User ka data fetch karo
        const user = await User.findOne({ clerkId: userId });
        const userName = user ? user.fullName : "";
        const userEmail = user ? user.email : "";

        const result = await Result.create({ 
            ...req.body, 
            userId, 
            userName, 
            userEmail 
        });
        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error("Error creating result:", error);
        res.status(500).json({ success: false, message: "Failed to create result." });
    }
}

// To get result for that logged-in user
export const getMyResult = async (req, res) => {
    const { userId } = getAuth(req);
    const results = await Result.find({ userId }).sort({ createdAt: -1 });
    res.json(results);
}