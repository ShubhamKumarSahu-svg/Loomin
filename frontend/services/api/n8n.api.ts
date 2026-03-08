const N8N_WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export type N8NPlatform = "linkedin" | "instagram" | "reddit" | "twitter";

export interface N8NPostPayload {
  user_id: string;
  image_url: string;
  content: Partial<Record<N8NPlatform, string>>;
  title: {
    default: string;
    reddit?: string;
  };
  tags: string[];
  platforms: N8NPlatform[];
  scheduled_time: string | null;
}

export async function submitPostToN8N(payload: N8NPostPayload): Promise<unknown> {
  if (!N8N_WEBHOOK_URL) {
    throw new Error("NEXT_PUBLIC_N8N_WEBHOOK_URL is not configured");
  }

  const res = await fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to submit post to n8n");
  }

  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return res.text();
}
