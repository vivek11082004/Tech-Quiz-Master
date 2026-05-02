import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";
import User from "../model/User.js";

export const protect = ClerkExpressWithAuth();

export const isAdmin = async (req, res, next) => {
    try {
        const clerkId = req.auth.userId;
        const user = await User.findOne({ clerkId });

        if(user && user.role === "admin") {
            next();
        } else {
            res.status(403).json({ success: false, message: "Access denied. Admins only." });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error." });
    }
}