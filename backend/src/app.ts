import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import devRoutes from "./routes/devRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cookieParser from "cookie-parser";

const app = express();

const corsOptions: cors.CorsOptions = {
  origin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/^\/api\/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/oauth", oauthRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/", devRoutes);
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "Backend running" });
});

export default app;  
