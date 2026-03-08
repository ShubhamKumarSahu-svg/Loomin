import axios from "axios";

/* ------------------------------------------------ */
export const getInstagramAuthUrl = (state: string) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error("Instagram OAuth not configured");
  }

  const scope =
    "instagram_basic,instagram_content_publish,pages_show_list";

  return (
    `https://www.facebook.com/v19.0/dialog/oauth` +
    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&response_type=code` +
    `&state=${encodeURIComponent(state)}`
  );
};


/* ------------------------------------------------ */
/* STEP 1: CODE → SHORT TOKEN */

export const exchangeInstagramCode = async (code: string) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;
  const REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI;

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      }
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
};


/* ------------------------------------------------ */
/* STEP 2: SHORT TOKEN → LONG TOKEN (60 DAYS) */

export const exchangeInstagramLongLivedToken = async (
  shortToken: string
) => {
  const CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID;
  const CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET;

  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        fb_exchange_token: shortToken
      }
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
};


/* ------------------------------------------------ */
/* STEP 3: GET INSTAGRAM BUSINESS ACCOUNT ID */

export const fetchInstagramUserId = async (accessToken: string) => {

  // get pages owned by the user
  const pages = await axios.get(
    "https://graph.facebook.com/v19.0/me/accounts",
    {
      params: {
        access_token: accessToken
      }
    }
  );

  if (!pages.data.data?.length) {
    return null;
  }

  // check each page for IG account
  for (const page of pages.data.data) {

    const pageDetails = await axios.get(
      `https://graph.facebook.com/v19.0/${page.id}`,
      {
        params: {
          fields: "instagram_business_account",
          access_token: accessToken
        }
      }
    );

    const igId = pageDetails.data.instagram_business_account?.id;

    if (igId) {
      return igId;
    }
  }

  return null;
};


/* ------------------------------------------------ */
/* STEP 4: REFRESH LONG TOKEN */

export const refreshInstagramLongToken = async (
  longToken: string
) => {
  const response = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "ig_refresh_token",
        access_token: longToken
      }
    }
  );

  return response.data as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };
};