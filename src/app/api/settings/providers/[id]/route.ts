import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, type AuthenticatedRequest } from "@/lib/middleware";
import { providerUpdateSchema, validateRequest } from "@/lib/validation";
import { logAudit, getClientIp } from "@/lib/audit";
import { errorResponse } from "@/lib/errors";

export const PUT = requireRole("ADMIN")(async (request: AuthenticatedRequest, context) => {
  try {
    const { id } = await context.params as { id: string };

    const validated = await validateRequest(providerUpdateSchema, request);
    if ("error" in validated) return validated.error;

    const existing = await prisma.aIProvider.findUnique({ where: { id } });
    if (!existing) return errorResponse("Provider not found", 404);

    if (validated.data.isDefault) {
      await prisma.aIProvider.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const provider = await prisma.aIProvider.update({
      where: { id },
      data: validated.data,
    });

    logAudit({
      userId: request.user.id,
      action: "PROVIDER_UPDATED",
      targetType: "provider",
      targetId: id,
      details: { name: provider.name },
      ipAddress: getClientIp(request),
    });

    const { apiKey: _apiKey, ...safe } = provider;
    return NextResponse.json({ provider: safe });
  } catch (e) {
    console.error("Failed to update provider:", e);
    return errorResponse("Failed to update provider", 500);
  }
});
