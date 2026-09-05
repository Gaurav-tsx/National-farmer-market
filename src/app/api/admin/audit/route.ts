import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { SECURITY_HEADERS } from "@/lib/security";
import { AdminRole, hasPermission } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const roleHeader = req.headers.get("x-admin-role") || "SUPER_ADMIN";

    if (!hasPermission(roleHeader as AdminRole, "VIEW_AUDIT_LOGS")) {
      return NextResponse.json(
        {
          error: "ACCESS_FORBIDDEN",
          message: "Role does not have permission to inspect system audit trails.",
        },
        { status: 403, headers: SECURITY_HEADERS }
      );
    }

    const logs = dataStore.getAuditTrails();
    return NextResponse.json({ data: logs }, { headers: SECURITY_HEADERS });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit trails", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
