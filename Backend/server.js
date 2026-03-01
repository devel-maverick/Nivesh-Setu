import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors({
  origin: ["https://nivesh-setu.vercel.app", "http://localhost:5173"],
  credentials: true
}));

// Health check endpoint for Render
app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Nivesh-Setu API is running" });
});

app.use("/api", analyzeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});