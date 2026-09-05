import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { SECURITY_HEADERS } from "@/lib/security";
import { AdminRole, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const roleHeader = req.headers.get("x-admin-role") || "COMPLIANCE_OFFICER";

    if (!hasPermission(roleHeader as AdminRole, "REVIEW_KYC")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Role does not have permission to view KYC verification queue. Required: COMPLIANCE_OFFICER or SUPER_ADMIN.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const records = dataStore.getKYCRecords();
    return NextResponse.json({ data: records }, { headers: SECURITY_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch KYC records", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { kycId, action, adminRole, adminEmail, adminName, reason } = body;

    // Check permission
    if (!adminRole || !hasPermission(adminRole as AdminRole, "REVIEW_KYC")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Role does not have permission to review KYC submissions. Required: COMPLIANCE_OFFICER or SUPER_ADMIN.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    if (!kycId || !action || !["APPROVE", "REJECT", "RESUBMIT"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid parameters. Action must be APPROVE, REJECT, or RESUBMIT." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updated = dataStore.reviewKYC({
      kycId,
      action,
      adminEmail: adminEmail || "compliance.officer@nam.gov.in",
      adminName: adminName || "Compliance Officer",
      adminRole: adminRole as AdminRole,
      reason,
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json(
      {
        success: true,
        message: `KYC status updated to ${updated.status} with audit trail logged.`,
        data: updated,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to review KYC", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
