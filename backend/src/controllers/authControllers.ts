import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { generateToken } from "../lib/utils.js";
import { User, type IUser } from "../models/userModel.js";

interface AuthRequestBody {
  fullName?: string;
  email?: string;
  password?: string;
}

export const signup = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      res.status(400).json({ message: "Please fill in all fields" });
      return;
    }

    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Your password must contain at least 6 characters" });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res
        .status(400)
        .json({ message: "A user with that email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPW = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      fullName,
      password: hashedPW,
    });

    await newUser.save();

    generateToken(newUser._id, res);

    res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
    });
  } catch (error) {
    console.error("Error in signup controller", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (
  req: Request<{}, {}, AuthRequestBody>,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    generateToken(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error("Error in login controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (
  _req: Request,
  res: Response
): void => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error in logout controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const checkAuth = (
  req: Request,
  res: Response
): void => {
  try {
    res.status(200).json(req.user as IUser | undefined);
  } catch (error) {
    console.error("Error in checkAuth controller", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
