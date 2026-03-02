import express from "express";
import cors from "cors";
import analyzeRoutes from "./routes/analyze.js";

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = [
  "https://nivesh-setu.vercel.app",
  "https://nivesh-setu-1.onrender.com",
  "http://localhost:5174",
  "http://localhost:3000",
];
if (process.env.FRONTEND_URL) {
  corsOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(",").forEach((o) => corsOrigins.push(o.trim()));
}

app.use(express.json());
app.use(cors({
  origin: corsOrigins,
  credentials: true
}));

app.get("/", (req, res) => {
  res.status(200).json({ status: "ok", message: "Nivesh-Setu API is running" });
});

app.use("/api", analyzeRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});