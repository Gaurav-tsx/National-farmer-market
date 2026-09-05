import { NextRequest, NextResponse } from "next/server";
import { SECURITY_HEADERS } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("nfm_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ authenticated: false, user: null }, { headers: SECURITY_HEADERS });
    }

    const session = JSON.parse(sessionCookie);
    return NextResponse.json({ authenticated: true, user: session }, { headers: SECURITY_HEADERS });
  } catch {
    return NextResponse.json({ authenticated: false, user: null }, { headers: SECURITY_HEADERS });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true }, { headers: SECURITY_HEADERS });
  response.cookies.delete("nfm_session");
  return response;
}
