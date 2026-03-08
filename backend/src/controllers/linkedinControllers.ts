import type { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { SocialAccount } from '../models/socialAccountModel.js';

export const getLinkedInOAuthUrl = (req: Request, res: Response) => {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

  if (!CLIENT_ID) {
    console.error("CRITICAL: LINKEDIN_CLIENT_ID is missing from backend .env!");
    return res.status(500).json({ message: "Server environment missing Client ID" });
  }

  const { userId, brandId } = req.query;

  if (!userId || !brandId) {
    return res.status(400).json({ message: "userId and brandId are required" });
  }

  // Use JWT to encode the state so it matches your other OAuth flows
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error("CRITICAL: JWT_SECRET is missing from backend .env!");
    return res.status(500).json({ message: "Server environment missing JWT Secret" });
  }

  const encodedState = jwt.sign(
    { userId, brandId, provider: "linkedin" },
    secret,
    { expiresIn: "10m" }
  );

  const scope = 'openid profile email w_member_social'; 
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=${encodedState}&scope=${encodeURIComponent(scope)}`;
  
  res.json({ url: authUrl });
};

export const handleLinkedInCallback = async (req: Request, res: Response) => {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

  const { code, state, error, error_description } = req.query;

  if (error) {
    console.error('LinkedIn OAuth Error:', error_description);
    return res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=false&error=${error}`);
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");

    // FIX: Verify and decode the JWT state instead of Base64 JSON parsing
    const decodedState = jwt.verify(state as string, secret) as { 
      userId: string; 
      brandId: string;
      provider?: string;
    };
    
    const { userId, brandId } = decodedState;

    const tokenResponse = await axios.post('https://www.linkedin.com/oauth/v2/accessToken', new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: REDIRECT_URI!,
      client_id: CLIENT_ID!,
      client_secret: CLIENT_SECRET!,
    }).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, expires_in } = tokenResponse.data;

    const profileResponse = await axios.get('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const linkedInId = profileResponse.data.sub;
    const linkedInName = profileResponse.data.name;
    const expiresAt = new Date(Date.now() + expires_in * 1000);

    await SocialAccount.findOneAndUpdate(
      { user_id: userId, platform: "linkedin" },
      {
        user_id: userId,
        access_token,
        refresh_token: "test_refresh_token",
        expires_at: expiresAt,
        meta: { linkedin_urn: `urn:li:person:${linkedInId}`, accountName: linkedInName }
      },
      { upsert: true, returnDocument: 'after' } 
    );

    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=true&brand=${brandId}`);

  } catch (err) {
    console.error('LinkedIn Callback Failed:', err);
    res.redirect(`${FRONTEND_URL}/dashboard?linkedin_connected=false`);
  }
};
