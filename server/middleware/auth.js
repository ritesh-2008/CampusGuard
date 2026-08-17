import { Supabase } from "../lib/supabase.js";

export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await Supabase.auth.getUser(token);

        if (error || !data.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        req.user = data.user;

        next();

    } catch (error) {
        console.error("Auth middleware error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed"
        });
    }
};