import type { Request, Response } from "express";
import { Brand } from "../models/brandModel.js";
import { SocialAccount } from "../models/socialAccountModel.js";
import { User } from "../models/userModel.js";
import type { PlatformType } from "../models/socialAccountModel.js";

interface BrandPayload {
  brand_name?: string;
  description?: string;
  brand_voice?: string;
  logo?: string;
  brand_colors?: string[];
  brand_style?: string;
  brand_text?: string;
  cta_style?: string;
  logo_url?: string;
  logo_position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
}

const mapBrandPayload = (body: Record<string, unknown>): BrandPayload => {
  const payload: BrandPayload = {};

  if (typeof body.name === "string") payload.brand_name = body.name;
  if (typeof body.brand_name === "string") payload.brand_name = body.brand_name;
  if (typeof body.description === "string") payload.description = body.description;

  const brandVoice =
    typeof body.brandVoice === "string"
      ? body.brandVoice
      : typeof body.brand_voice === "string"
        ? body.brand_voice
        : undefined;
  if (brandVoice) payload.brand_voice = brandVoice;

  const logo =
    typeof body.logo === "string"
      ? body.logo
      : typeof body.logo_url === "string"
        ? body.logo_url
        : undefined;
  if (logo) payload.logo = logo;

  const colors = Array.isArray(body.brandColors)
    ? (body.brandColors as unknown[]).filter((v): v is string => typeof v === "string")
    : Array.isArray(body.brand_colors)
      ? (body.brand_colors as unknown[]).filter((v): v is string => typeof v === "string")
      : undefined;
  if (colors) payload.brand_colors = colors;

  const brandStyle =
    typeof body.brandStyle === "string"
      ? body.brandStyle
      : typeof body.brand_style === "string"
        ? body.brand_style
        : undefined;
  if (brandStyle) payload.brand_style = brandStyle;

  const brandText =
    typeof body.brandText === "string"
      ? body.brandText
      : typeof body.brand_text === "string"
        ? body.brand_text
        : undefined;
  if (brandText) payload.brand_text = brandText;

  const ctaStyle =
    typeof body.ctaStyle === "string"
      ? body.ctaStyle
      : typeof body.cta_style === "string"
        ? body.cta_style
        : undefined;
  if (ctaStyle) payload.cta_style = ctaStyle;

  const logoUrl =
    typeof body.logoUrl === "string"
      ? body.logoUrl
      : typeof body.logo_url === "string"
        ? body.logo_url
        : undefined;
  if (logoUrl) payload.logo_url = logoUrl;

  const logoPosition =
    typeof body.logoPosition === "string"
      ? body.logoPosition
      : typeof body.logo_position === "string"
        ? body.logo_position
        : undefined;
  if (
    logoPosition === "top-left" ||
    logoPosition === "top-right" ||
    logoPosition === "bottom-left" ||
    logoPosition === "bottom-right" ||
    logoPosition === "center"
  ) {
    payload.logo_position = logoPosition;
  }

  return payload;
};

const toBrandResponse = (brand: any) => ({
  ...brand,
  name: brand.brand_name,
  brandVoice: brand.brand_voice,
  brandColors: brand.brand_colors,
  brandStyle: brand.brand_style,
  brandText: brand.brand_text,
  ctaStyle: brand.cta_style,
  logoUrl: brand.logo_url,
  logoPosition: brand.logo_position,
});

export const createBrand = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const payload = mapBrandPayload(req.body as Record<string, unknown>);
    const { brand_name } = payload;

    if (!brand_name) {
      res.status(400).json({ message: "Brand name is required" });
      return;
    }

    const authUserId = req.user!._id;

    // 1. Check if brand exists for this specific user
    const existing = await Brand.findOne({ 
      brand_name, 
      userId: authUserId 
    });

    if (existing) {
      res.status(400).json({ message: "Brand already exists" });
      return;
    }

    const brand = await Brand.create({
      ...payload,
      userId: authUserId,
    });

    await User.findByIdAndUpdate(authUserId, {
      $addToSet: { brandsId: brand._id }, 
    });

    res.status(201).json(toBrandResponse(brand.toObject()));
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      res.status(400).json({ message: "Brand already exists" });
      return;
    }

    console.error("Create Brand Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateBrand = async (
  req: Request<{ brandId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { brandId } = req.params;
    if (!brandId) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const payload = mapBrandPayload(req.body as Record<string, unknown>);
    delete payload.brand_name;

    const updated = await Brand.findOneAndUpdate(
      { _id: brandId, userId: req.user!._id.toString() },
      { $set: payload },
      { new: true }
    );

    if (!updated) {
      res.status(404).json({ message: "Brand not found" });
      return;
    }

    res.status(200).json(toBrandResponse(updated.toObject()));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const brands = await Brand.find({ userId }).sort({ createdAt: -1 }).lean();

    if (brands.length === 0) {
      res.status(200).json([]);
      return;
    }

    const socialAccounts = await SocialAccount.find({
      user_id: userId,
    })
      .select("platform")
      .lean();

    const connectedPlatforms = Array.from(
      new Set(socialAccounts.map((account) => account.platform))
    ) as PlatformType[];

    res.status(200).json(
      brands.map((brand) => ({
        ...toBrandResponse(brand as unknown as Record<string, unknown>),
        connectedPlatforms,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getBrandConnections = async (
  req: Request<{ brandId: string }>,
  res: Response
): Promise<void> => {
  try {
    const { brandId } = req.params;
    if (!brandId) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const userId = req.user!._id.toString();
    const connections = await SocialAccount.find({
      user_id: userId,
    })
      .select("platform expires_at updated_at updatedAt")
      .lean();

    res.status(200).json(connections);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

interface DisconnectParams {
  brandId: string;
  provider: PlatformType;
}

export const disconnectPlatform = async (
  req: Request & { params: DisconnectParams },
  res: Response
): Promise<void> => {
  try {
    const { brandId, provider } = req.params;

    if (!brandId) {
      res.status(400).json({ message: "Invalid brandId" });
      return;
    }

    const deleted = await SocialAccount.findOneAndDelete({
      platform: provider,
      user_id: req.user!._id.toString(),
    });

    if (!deleted) {
      res.status(404).json({ message: "Platform not connected" });
      return;
    }

    res.status(200).json({
      message: `${provider} disconnected successfully`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
