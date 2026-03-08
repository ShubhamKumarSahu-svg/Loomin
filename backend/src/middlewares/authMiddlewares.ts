import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";

import  {User } from "../models/userModel.js";
import type {IUser} from "../models/userModel.js";

interface CustomJwtPayload extends JwtPayload {
  userId?: string;
  sub?: string;
}

const findUserFromTokenId = async (tokenUserId: string) => {
  const user = await User.findById(tokenUserId)
    .select("-password")
    .lean<Omit<IUser, "password"> & { _id: string }>();
  return user ?? null;
};

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // 1️⃣ Check Authorization header (Postman / API clients)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // 2️⃣ Fallback to cookie (Browser flow)
    if (!token && req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      res.status(401).json({ message: "Unauthorized - No token provided" });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as CustomJwtPayload;

    const tokenUserId = decoded?.userId ?? decoded?.sub;

    if (!tokenUserId) {
      res.status(401).json({ message: "Unauthorized - Invalid token" });
      return;
    }

    const user = await findUserFromTokenId(tokenUserId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(401).json({ message: "Unauthorized - Invalid token" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
};
