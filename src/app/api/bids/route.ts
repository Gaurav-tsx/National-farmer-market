import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { SECURITY_HEADERS } from "@/lib/security";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { listingId, buyerId, buyerName, bidAmount, notes } = body;

    if (!listingId || !bidAmount) {
      return NextResponse.json(
        { error: "Missing required listingId or bidAmount" },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const bid = dataStore.addBid({
      listingId,
      buyerId: buyerId || "usr-buyer-201",
      buyerName: buyerName || "Bharat Agro Commodities Ltd.",
      bidAmount: Number(bidAmount),
      notes,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Commercial bid recorded and farmgate escrow reservation initiated.",
        data: bid,
      },
      { status: 201, headers: SECURITY_HEADERS }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to place bid", details: String(error) },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
