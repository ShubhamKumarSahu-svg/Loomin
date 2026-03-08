import axios from "axios";

export const getLinkedInAuthUrl = (state: string) => {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error("LinkedIn OAuth not configured");
  }

  const scope = "openid profile email w_member_social";

  return (
    `https://www.linkedin.com/oauth/v2/authorization` +
    `?response_type=code` +
    `&client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${encodeURIComponent(state)}`
  );
};

export const exchangeLinkedInCode = async (code: string) => {
  const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
  const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
  const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    throw new Error("LinkedIn OAuth not configured");
  }

  const tokenResponse = await axios.post(
    "https://www.linkedin.com/oauth/v2/accessToken",
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  return tokenResponse.data as {
    access_token: string;
    expires_in: number;
  };
};

export const fetchLinkedInProfile = async (accessToken: string) => {
  const response = await axios.get(
    "https://api.linkedin.com/v2/userinfo",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return response.data;
};