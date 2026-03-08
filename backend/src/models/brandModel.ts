import { Schema, model } from "mongoose";
import { randomUUID } from "crypto";


export interface IBrand {
  _id: string; 
  userId: string; 
  brand_name: string;
  brand_voice?: string;
  logo?: string;
  brand_colors?: string[];
  brand_style?: string;
  brand_text?: string;
  cta_style?: string;
  logo_url?: string;
  logo_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const brandSchema = new Schema<IBrand>(
  {
    _id: {
      type: String,
      default: () => randomUUID(),
    },
  
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    brand_name: { type: String, required: true },
    brand_voice: String,
    logo: String,
    brand_colors: [{ type: String }],
    brand_style: String,
    brand_text: String,
    cta_style: String,
    logo_url: String,
    logo_position: {
      type: String,
      enum: ["top-left", "top-right", "bottom-left", "bottom-right", "center"],
    },
  },
  { timestamps: true }
);

brandSchema.index({ userId: 1, brand_name: 1 }, { unique: true });

export const Brand = model<IBrand>("Brand", brandSchema);
