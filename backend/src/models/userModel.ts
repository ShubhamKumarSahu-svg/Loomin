
import { Schema, model } from "mongoose";
import { randomUUID } from "crypto";

export interface IUser {
  _id: string;
  email: string;
  password: string;
  fullName: string;
  brandsId: string[];
  role: "user" | "admin";
}

const userSchema = new Schema<IUser>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
    
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    fullName: {
      type: String,
      required: true,
    },
    brandsId: [
      {
        type: String,
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

export const User = model<IUser>("User", userSchema);
