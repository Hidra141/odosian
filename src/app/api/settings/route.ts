import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, type AuthenticatedRequest } from "@/lib/middleware";
import { errorResponse } from "@/lib/errors";

export const GET = requireRole("ADMIN")(async (_request: AuthenticatedRequest) => {
  try {
    const [allSettings, providers, prompts] = await Promise.all([
      prisma.setting.findMany({ orderBy: { category: "asc" } }),
      prisma.aIProvider.findMany({ orderBy: { name: "asc" } }),
      prisma.prompt.findMany({ orderBy: { name: "asc" } }),
    ]);

    const settings: Record<string, typeof allSettings> = {};
    for (const s of allSettings) {
      if (!settings[s.category]) settings[s.category] = [];
      settings[s.category].push(s);
    }

    return NextResponse.json({
      settings,
      providers: providers.map(({ apiKey: _apiKey, ...rest }) => rest),
      prompts: prompts.map((p) => ({
        ...p,
        systemPromptPreview: p.systemPrompt.slice(0, 200) + (p.systemPrompt.length > 200 ? "..." : ""),
      })),
    });
  } catch (e) {
    console.error("Failed to fetch settings:", e);
    return errorResponse("Failed to fetch settings", 500);
  }
});
