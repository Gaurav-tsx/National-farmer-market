import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { redis } from "@/lib/redis";
import { SECURITY_HEADERS } from "@/lib/security";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const district = searchParams.get("district") || "all";
    const category = searchParams.get("category") || "all";

    // Check Redis district cache if filtering by a specific district
    if (district !== "all" && category === "all") {
      const cached = await redis.getCachedDistrictListings(district);
      if (cached) {
        return NextResponse.json(
          { source: "redis-cache", district, ttl: "180s", data: cached },
          { headers: { ...SECURITY_HEADERS, "X-Cache": "HIT" } }
        );
      }
    }

    const listings = dataStore.getListings(district, category);

    // If specific district, set cache: SET listing:district:[id] EX 180
    if (district !== "all" && category === "all") {
      await redis.setCachedDistrictListings(district, listings);
    }

    return NextResponse.json(
      { source: "data-store", district, category, count: listings.length, data: listings },
      { headers: { ...SECURITY_HEADERS, "X-Cache": "MISS" } }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch product listings", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "127.0.0.1";
    // Sliding-window rate limit: 15 listings submissions per minute
    const rateCheck = redis.checkRateLimit(`ratelimit:listing:${clientIp}`, 15, 60);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "TOO_MANY_REQUESTS",
          message: `Submission rate limit exceeded. Try again in ${rateCheck.resetInSeconds} seconds.`,
        },
        { status: 429, headers: SECURITY_HEADERS }
      );
    }

    const body = await req.json();
    const {
      farmerId,
      category,
      commodity,
      quantityQuintal,
      minOfferPrice,
      harvestDate,
      images,
      isOrganic,
      pincode,
      district,
      state,
    } = body;

    if (!commodity || !quantityQuintal || !minOfferPrice || !district) {
      return NextResponse.json(
        { error: "Missing required listing fields" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const newListing = dataStore.createListing({
      farmerId: farmerId || "usr-farmer-101",
      category: category || "Vegetables",
      commodity,
      quantityQuintal: Number(quantityQuintal),
      minOfferPrice: Number(minOfferPrice),
      harvestDate: harvestDate || new Date().toISOString(),
      images: images && images.length ? images : [
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      ],
      isOrganic: Boolean(isOrganic),
      pincode: pincode || "422003",
      district: district || "Nashik",
      state: state || "Maharashtra",
    });

    // Invalidate the district cache for this district
    await redis.del(`listing:district:${district}`);

    return NextResponse.json(
      {
        success: true,
        message: "Produce listing successfully created and published.",
        data: newListing,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product listing", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
