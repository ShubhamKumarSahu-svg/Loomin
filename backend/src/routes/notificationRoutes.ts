import express from "express";
import {
  getNotifications,
  markNotificationRead,
  syncAnalyticsNotifications,
} from "../controllers/notificationController.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.patch("/:notificationId/read", protectRoute, markNotificationRead);
router.post("/sync-analytics", protectRoute, syncAnalyticsNotifications);

export default router;
