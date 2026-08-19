import express from "express";
import cors from "cors";
import "dotenv/config";
import { Supabase } from "./lib/supabase.js";
import incidentrouter from "./router/incident.router.js";
import authrouter from "./router/auth.router.js";

// Prevent unhandled rejections from crashing the server.
process.on("unhandledRejection", (err) => {
    console.error("Unhandled rejection:", err);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
});

const app = express();

const port = process.env.PORT || 3000
const host = process.env.HOST || "0.0.0.0"

app.use(express.json());

const clientOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
    origin: clientOrigin.split(",").map(origin => origin.trim())
}));

app.get("/health", (req, res) => {
    res.json({ status: 'ok', message: 'CampusGuard Backend is running' })
})

app.get("/test-db", async(req, res) => {
    try {
        const { data, error } = await Supabase.from("incidents").select("*");

        if (error) {
            return res.status(505).json({
                success: false, message: error.message, details: error.details,
                hint: error.hint
            })
        }

        res.json({
            success: true,
            data
        })
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
})

app.use("/api/incidents", incidentrouter);
app.use("/api/auth", authrouter);

// Global error handler — Express 5 requires this to catch async errors.
app.use((err, req, res, next) => {
    console.error("Express error:", err);
    if (!res.headersSent) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

app.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`)
})