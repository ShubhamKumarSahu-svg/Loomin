import { Post } from "@/types/domain.type";

export const mockPosts: Post[] = [
  {
    id: "p1",
    brandId: "b1",
    masterBrief: {
      topic: "AI in Marketing",
      goal: "Increase engagement",
      targetAudience: "Startup founders",
    },
    platformDrafts: [
      {
        platform: "linkedin",
        content:
          "AI is redefining marketing strategy. Here’s how founders can leverage it.",
        hashtags: ["#AI", "#Marketing", "#Startups"],
        version: 1,
        status: "awaiting_review",
        aiGenerated: true,
        updatedAt: new Date().toISOString(),
      },
    ],
    overallStatus: "awaiting_review",
    createdAt: new Date().toISOString(),
  },
  {
    id: "p2",
    brandId: "b1",
    masterBrief: {
      topic: "Content Strategy",
      goal: "Drive awareness",
      targetAudience: "Creators",
    },
    platformDrafts: [
      {
        platform: "instagram",
        content:
          "Content strategy isn’t about posting daily. It’s about posting intentionally.",
        hashtags: ["#Content", "#Strategy"],
        version: 2,
        status: "published",
        aiGenerated: true,
        updatedAt: new Date().toISOString(),
      },
    ],
    overallStatus: "published",
    createdAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  },
];