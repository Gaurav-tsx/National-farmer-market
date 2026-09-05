import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { SECURITY_HEADERS } from "@/lib/security";
import { AdminRole, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const roleHeader = req.headers.get("x-admin-role") || "SUPER_ADMIN";

    if (!hasPermission(roleHeader as AdminRole, "MANAGE_STAFF")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Role does not have permission to manage staff. Required: SUPER_ADMIN.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const staffList = dataStore.getStaffList();
    return NextResponse.json({ data: staffList }, { headers: SECURITY_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch staff list", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newRole, adminRole, adminEmail } = body;

    if (!hasPermission(adminRole as AdminRole, "MANAGE_STAFF")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Only SUPER_ADMIN can modify staff roles or provision access.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    if (!email || !newRole) {
      return NextResponse.json(
        { error: "Missing required email or newRole" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const updated = dataStore.updateStaffRole(
      email,
      newRole as AdminRole,
      adminEmail || "super.admin@agri.gov.in"
    );

    return NextResponse.json(
      {
        success: true,
        message: `Staff role for ${email} updated to ${newRole}`,
        data: updated,
      },
      { headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update staff role", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
