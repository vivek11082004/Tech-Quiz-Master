import User from "../model/User.js";
import "dotenv/config.js";
import { Webhook } from "svix";

export const clerkWebhook = async (req, res) => {
    try {
        console.log("🚀 Webhook triggered successfully!");

        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
        const payload = req.body.toString();
        const headers = req.headers;

        const webhook = new Webhook(WEBHOOK_SECRET);

        const evt = webhook.verify(payload, {
            "svix-id": headers["svix-id"],
            "svix-timestamp": headers["svix-timestamp"],
            "svix-signature": headers["svix-signature"],
        });

        const { type, data } = evt;
        console.log("EVENT TYPE:", type);

        // ✅ USER CREATED
        if (type === "user.created") {
            const primaryEmail =
                data.email_addresses?.find(
                    (e) => e.id === data.primary_email_address_id
                )?.email_address || "";

            // Make admin email configurable via .env
            const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "vivekbhai100.vk_email";
            const role =
                primaryEmail === ADMIN_EMAIL
                    ? "admin"
                    : "user";

            await User.findOneAndUpdate(
                { clerkId: data.id },
                {
                    clerkId: data.id,
                    email: primaryEmail,
                    fullName: `${data.first_name || ""} ${data.last_name || ""}`,
                    role: role,
                },
                { upsert: true, new: true }
            );
        }

        // ✅ LOGIN
        if (type === "session.created") {
            console.log("Login Detected");

            try {
                let user = await User.findOne({ clerkId: data.user_id });

                // Defensive: get user object from event
                const userObj = data.user || {};
                const primaryEmail =
                    (userObj.email_addresses && userObj.email_addresses[0] && userObj.email_addresses[0].email_address) || "";
                const fullName = `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || "No Name";

                if (!user && userObj.id) {
                    // Create user if not exists
                    await User.create({
                        clerkId: userObj.id,
                        email: primaryEmail || "noemail@unknown.com",
                        fullName: fullName,
                        role: "user",
                        isLoggedIn: true,
                    });
                    console.log("User created in DB from session.created:", userObj.id, primaryEmail, fullName);
                } else {
                    // Update isLoggedIn if user exists
                    await User.findOneAndUpdate(
                        { clerkId: data.user_id },
                        { isLoggedIn: true },
                        { upsert: true, new: true }
                    );
                    console.log("User updated in DB from session.created:", data.user_id);
                }
            } catch (err) {
                console.error("❌ Error in session.created user DB logic:", err);
            }
        }

        // ✅ LOGOUT
        if (type === "session.deleted" || type === "session.removed") {
            console.log("Logout Detected");

            await User.findOneAndUpdate(
                { clerkId: data.user_id },
                {
                    clerkId: data.user_id,
                    isLoggedIn: false,
                },
                { upsert: true, new: true }
            );
        }

        // ✅ Always send response
        res.status(200).json({
            message: "Webhook processed successfully",
            success: true,
        });

    } catch (error) {
        console.error("❌ Error processing webhook:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};