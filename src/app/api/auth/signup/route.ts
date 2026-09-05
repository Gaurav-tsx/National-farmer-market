import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dataStore } from "@/lib/data-store";
import { PREDEFINED_ADMIN_STAFF, isPermittedEnterpriseDomain } from "@/lib/auth";
import { SECURITY_HEADERS, generateSessionToken } from "@/lib/security";

// Track in-memory anti-spam cooldowns (5s minimum spacing per IP)
const recentSignupAttempts = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const { fullName, mobileNumber, email, role, password, confirmPassword } = body;

    // 1. Basic validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your full name." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!mobileNumber || typeof mobileNumber !== "string" || mobileNumber.replace(/\D/g, "").length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanRole =
      role === "COMMERCIAL_BUYER" || role === "FPO_REPRESENTATIVE" ? role : "FARMER";

    const spamKey = `${ip}:${mobileNumber.trim()}`;
    const now = Date.now();

    // 2. Anti-spam 5-second cooldown check
    const lastAttempt = recentSignupAttempts.get(spamKey);
    if (lastAttempt && now - lastAttempt < 5000) {
      const waitRemaining = Math.ceil((5000 - (now - lastAttempt)) / 1000);
      return NextResponse.json(
        {
          success: false,
          error: `Anti-spam protection active. Please wait ${waitRemaining}s before requesting again.`,
          waitSeconds: waitRemaining,
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            "Retry-After": waitRemaining.toString(),
          },
        }
      );
    }
    recentSignupAttempts.set(spamKey, now);

    // 3. Sliding window rate limiter: 10 requests per 5 minutes (300 seconds)
    const rateLimit = redis.checkRateLimit(`ratelimit:auth:signup:${ip}`, 10, 300);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil(rateLimit.resetInSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many registration attempts. Please come back in ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""} (Rate Limit Exceeded).`,
          lockout: true,
          resetInSeconds: rateLimit.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            ...SECURITY_HEADERS,
            "Retry-After": rateLimit.resetInSeconds.toString(),
          },
        }
      );
    }

    // 4. Check if account already exists with this mobile or email
    const existingMobile = dataStore.findUserByEmailOrPhone(mobileNumber);
    if (existingMobile) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this mobile number already exists. Please sign in instead.",
        },
        { status: 409, headers: SECURITY_HEADERS }
      );
    }

    if (email) {
      const existingEmail = dataStore.findUserByEmailOrPhone(email);
      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email address already exists. Please sign in instead.",
          },
          { status: 409, headers: SECURITY_HEADERS }
        );
      }
    }

    // 5. Admin check
    const cleanEmail = (email || "").toLowerCase().trim();
    const isAdminEmail =
      cleanEmail === "gaurav.verma.admin@gmail.com" ||
      isPermittedEnterpriseDomain(cleanEmail) ||
      PREDEFINED_ADMIN_STAFF.some((s) => s.email.toLowerCase() === cleanEmail);

    // 6. Create User in DataStore
    const user = dataStore.createUser({
      fullName: fullName.trim(),
      phoneNumber: mobileNumber.trim(),
      email: cleanEmail || undefined,
      password,
      role: cleanRole,
    });

    const sessionToken = generateSessionToken();
    const sessionData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: isAdminEmail ? "SUPER_ADMIN" : user.role,
      isAdmin: isAdminEmail,
      kycStatus: user.kycStatus,
      token: sessionToken,
      district: user.district,
      state: user.state,
      createdAt: user.createdAt,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: sessionData,
        redirect: isAdminEmail ? "/admin" : "/",
        remainingAttempts: rateLimit.remaining,
      },
      { headers: SECURITY_HEADERS }
    );

    // Set cookie
    response.cookies.set({
      name: "nfm_session",
      value: JSON.stringify(sessionData),
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: unknown) {
    console.error("Auth signup API exception:", err);
    return NextResponse.json(
      { success: false, error: "Registration service error. Please try again." },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
