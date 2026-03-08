import { Router, type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import {User} from "../models/userModel.js";
import type { Types } from "mongoose";

const router = Router();

interface DevLoginParams {
  userId: string;
}

router.get(
  "/dev-login/:userId",
  async (
    req: Request<DevLoginParams>,
    res: Response
  ): Promise<void> => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);

      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ message: "JWT_SECRET not configured" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id.toString() },
        jwtSecret,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        sameSite: "strict",
        secure: false, // localhost only
        path: "/",
      });

      res.status(200).json({
        message: "Dev login successful",
        userId: user._id,
      });

    } catch (error) {
      console.error("Dev login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
