import express from "express";
import { oauthAuth, oauthCallback } from "../controllers/oauthController.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";


const router = express.Router();

router.get("/:provider", protectRoute, oauthAuth);
router.get("/:provider/callback", oauthCallback);

export default router;
