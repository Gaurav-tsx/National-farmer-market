import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { redis } from "@/lib/redis";
import { SECURITY_HEADERS } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    // Rate limit: max 10 KYC submissions per hour per IP
    const rateCheck = redis.checkRateLimit(`ratelimit:kyc:${clientIp}`, 10, 3600);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: `KYC submission rate limit exceeded. Please retry after ${rateCheck.resetInSeconds} seconds.`,
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const { userId, documentType, rawId, holderName, state, district, pincode, cropDeclaration } = body;

    if (!documentType || !rawId || !holderName || !district || !pincode) {
      return NextResponse.json(
        { error: "Missing required KYC verification fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    // Never save raw ID! Handled inside submitNewKYC via SHA-256 peppered hashing & masking
    const newKyc = dataStore.submitNewKYC({
      userId: userId || `usr-${Date.now()}`,
      documentType,
      rawId,
      holderName,
      state: state || "Maharashtra",
      district,
      pincode,
      cropDeclaration,
    });

    return NextResponse.json(
      {
        success: true,
        message: "DigiLocker e-KYC submitted successfully. Status is now PENDING_REVIEW.",
        data: {
          id: newKyc.id,
          maskedId: newKyc.docHashOrId,
          verificationRef: newKyc.verificationRef,
          status: newKyc.status,
        },
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit KYC verification", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
