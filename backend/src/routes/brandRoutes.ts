import express from "express";
import {
  createBrand,
  updateBrand,
  getBrands,
  getBrandConnections,
  disconnectPlatform,
} from "../controllers/brandController.js";
import { protectRoute } from "../middlewares/authMiddlewares.js";


const router = express.Router();

router.get("/", protectRoute, getBrands);
router.post("/", protectRoute, createBrand);
router.patch("/:brandId", protectRoute, updateBrand);
router.get("/:brandId/connections", protectRoute, getBrandConnections);
router.delete("/:brandId/disconnect/:provider", protectRoute, disconnectPlatform);

export default router;
