import { Supabase } from "../lib/supabase.js";

export const incidents = async (req, res) => {
    try {
        const {
            type,
            description,
            severity
        } = req.body;

        if (!type || !description || !severity) {
            return res.status(400).json({ success: false, message: "Type, description and severity are required" })
        }

        const { data, error } = await Supabase.from("incidents").insert({
            type, description
            , severity, status: "pending", reported_by: req.user.id
        }).select().single();

        if (error) {
            console.log("Supabase error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to create incident"
            });
        }

        res.status(201).json({
            success: true,
            incident: data
        });
    } catch (error) {
        console.error("Create incident error:", error);

        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}
