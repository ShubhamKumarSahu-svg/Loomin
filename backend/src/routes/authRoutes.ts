import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
} from "../controllers/authControllers.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";
import { getLinkedInOAuthUrl, handleLinkedInCallback } from "../controllers/linkedinControllers.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);
router.get("/check", checkAuth);
router.get('/linkedin/url', getLinkedInOAuthUrl);
router.get('/linkedin/callback', handleLinkedInCallback);

export default router;