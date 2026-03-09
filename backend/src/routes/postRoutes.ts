import express from "express";
import { protectRoute } from "../middlewares/authMiddlewares.js";
import { approvePost, generatePostDraft, getPosts, publishDraftPost,improvePostDraft ,rejectPostDraft} from "../controllers/postController.js";

const router = express.Router();

router.get("/", protectRoute, getPosts);
router.post("/generate", protectRoute, generatePostDraft);
router.post("/:postId/publish", protectRoute, publishDraftPost);
router.post("/:postId/approve", protectRoute, approvePost);
router.post("/:postId/improve", protectRoute, improvePostDraft);
router.post("/:postId/reject", protectRoute, rejectPostDraft);
export default router;
