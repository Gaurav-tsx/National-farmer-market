import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { redis } from "@/lib/redis";
import { SECURITY_HEADERS } from "@/lib/security";
import { AdminRole, hasPermission } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, minPrice, maxPrice, modalPrice, adminRole, adminEmail, adminName, reason } = body;

    // Check permission
    if (!adminRole || !hasPermission(adminRole as AdminRole, "UPDATE_MANDI_PRICES")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Role does not have permission to update APMC spot rates. Required: MANDI_AUDITOR or SUPER_ADMIN.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    if (!id || minPrice === undefined || maxPrice === undefined || modalPrice === undefined) {
      return NextResponse.json(
        { error: "Missing required price fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updated = dataStore.updateMandiPrice({
      id,
      minPrice: Number(minPrice),
      maxPrice: Number(maxPrice),
      modalPrice: Number(modalPrice),
      adminEmail: adminEmail || "mandi.auditor@nam.gov.in",
      adminName: adminName || "Mandi Auditor",
      adminRole: adminRole as AdminRole,
      reason,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    // Invalidate the 15-minute Mandi cache immediately
    await redis.invalidateMandiRates();

    return NextResponse.json(
      {
        success: true,
        message: `Mandi ticker updated and cache invalidated for APMC: ${updated.marketAPMC}`,
        data: updated,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update Mandi spot price", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
