import { NextRequest, NextResponse } from "next/server";
import { validateGoogleAdminAccess, GoogleAuthProfile } from "@/lib/auth";
import { dataStore } from "@/lib/data-store";
import { SECURITY_HEADERS } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = body as GoogleAuthProfile;

    if (!profile || !profile.email) {
      return NextResponse.json(
        { error: "BAD_REQUEST", message: "Missing Google profile payload" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const staffList = dataStore.getStaffList();
    const validation = validateGoogleAdminAccess(profile, staffList);

    // If unauthorized, log the access attempt to audit trail and return strict 403
    if (!validation.authorized) {
      dataStore.addAuditTrail({
        adminId: profile.email,
        adminName: profile.name || "Unauthorized Attempt",
        adminRole: "DISPUTE_MANAGER", // placeholder
        action: "UNAUTHORIZED_LOGIN_ATTEMPT",
        targetEntity: "AdminStaffAllowlist",
        targetId: profile.email,
        ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
        metadata: {
          code: validation.code,
          email_verified: profile.email_verified,
          reason: validation.message,
        },
      });

      return NextResponse.json(
        {
          error: validation.code,
          message: validation.message,
          attemptedEmail: profile.email,
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    // Successfully verified and allowlisted
    dataStore.addAuditTrail({
      adminId: validation.staff!.email,
      adminName: validation.staff!.name,
      adminRole: validation.staff!.role,
      action: "ADMIN_SSO_LOGIN",
      targetEntity: "AdminSession",
      targetId: validation.staff!.id,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      metadata: {
        provider: "Google_OAuth2",
        email_verified: true,
        role: validation.staff!.role,
      },
    });

    return NextResponse.json(
      {
        success: true,
        session: validation.staff,
        message: `Welcome ${validation.staff!.name}. Role authorized: ${validation.staff!.role}`,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "SSO_ERROR", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
