import { NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { redis } from "@/lib/redis";
import { SECURITY_HEADERS } from "@/lib/security";

export async function GET() {
  try {
    // Check 15-minute cached rates first
    const cached = await redis.getCachedMandiRates();
    if (cached) {
      return NextResponse.json(
        { source: "redis-cache", ttl: "15m", data: cached },
        { headers: { ...SECURITY_HEADERS, "X-Cache": "HIT" } }
      );
    }

    const freshRates = dataStore.getMandiTickers();
    // Cache for 15 minutes (900 seconds)
    await redis.setCachedMandiRates(freshRates);

    return NextResponse.json(
      { source: "apmc-primary", ttl: "15m", data: freshRates },
      { headers: { ...SECURITY_HEADERS, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch APMC spot prices", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
