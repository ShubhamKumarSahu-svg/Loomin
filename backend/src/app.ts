import express from "express";
import type { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import axios from "axios";

const app = express();

cron.schedule("*/10 * * * *", async () => {
  try {
    await axios.get(`${process.env.BACKEND_URL}/health`);
    console.log("Self ping successful");
  } catch (err) {
    console.log("Self ping failed");
  }
});

const allowedOrigin =
  process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/", devRoutes);

app.get("/health", (_req:Request, res: Response) => {
  res.status(200).json({ status: "Backend running" });
});

export default app;