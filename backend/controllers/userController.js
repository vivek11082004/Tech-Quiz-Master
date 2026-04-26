import User from "../model/User.js";
import { getAuth } from "@clerk/express";

// To get stats of a user
export const getStats = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        // const user = await User.findById(userId);
        if (!userId) {
            return res.status(404).json({ message: "User not found" });
        }
       const totalUsers = await User.countDocuments();
       const loggedInUsers = await User.countDocuments({ isLoggedIn: true });
       res.json({ totalUsers, loggedInUsers: loggedInUsers, loggedInPercentage: totalUsers > 0 ? ((loggedInUsers / totalUsers) * 100).toFixed(2) : "0.00" });

    } catch (error) {
        console.error("Error fetching user stats:", error);
        res.status(500).json({ message: "Error fetching user stats" });
    }
};

