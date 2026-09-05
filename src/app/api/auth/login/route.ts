import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { dataStore } from "@/lib/data-store";
import { PREDEFINED_ADMIN_STAFF, isPermittedEnterpriseDomain } from "@/lib/auth";
import { SECURITY_HEADERS, generateSessionToken } from "@/lib/security";

// Track in-memory anti-spam cooldowns (5s minimum spacing per IP)
const recentAttempts = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const body = await req.json();
    const { identifier, password, isGoogleAuth, isOtpAuth } = body;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "Email or Mobile Number is required." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const spamKey = `${ip}:${cleanIdentifier}`;
    const now = Date.now();

    // 1. Anti-spam 5-second cooldown check
    const lastAttempt = recentAttempts.get(spamKey);
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
    recentAttempts.set(spamKey, now);

    // 2. Sliding window rate limiter: 10 requests per 5 minutes (300 seconds)
    const rateLimit = redis.checkRateLimit(`ratelimit:auth:login:${ip}`, 10, 300);
    if (!rateLimit.allowed) {
      const waitMinutes = Math.ceil(rateLimit.resetInSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Please come back in ${waitMinutes} minute${waitMinutes > 1 ? "s" : ""} (Rate Limit Exceeded).`,
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

    // 3. Admin Check: Is this gaurav.verma.admin@gmail.com or an official gov domain?
    const adminStaff = PREDEFINED_ADMIN_STAFF.find(
      (s) => s.email.toLowerCase() === cleanIdentifier
    );
    const isGovDomain = isPermittedEnterpriseDomain(cleanIdentifier);

    if (adminStaff || isGovDomain) {
      // Admin account
      const sessionToken = generateSessionToken();
      const adminRole = adminStaff ? adminStaff.role : "COMPLIANCE_OFFICER";
      const adminName = adminStaff ? adminStaff.name : "Government Official";

      const sessionData = {
        id: adminStaff ? adminStaff.id : `admin-${Date.now()}`,
        fullName: adminName,
        email: cleanIdentifier,
        role: adminRole,
        isAdmin: true,
        kycStatus: "VERIFIED",
        token: sessionToken,
        createdAt: new Date().toISOString(),
      };

      const response = NextResponse.json(
        {
          success: true,
          user: sessionData,
          redirect: "/admin",
          remainingAttempts: rateLimit.remaining,
        },
        { headers: SECURITY_HEADERS }
      );

      // Set session cookie
      response.cookies.set({
        name: "nfm_session",
        value: JSON.stringify(sessionData),
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return response;
    }

    // 4. Google Auth Flow or Phone OTP Quick Sign In
    if (isGoogleAuth || isOtpAuth) {
      let user = dataStore.findUserByEmailOrPhone(cleanIdentifier);
      if (!user) {
        // Auto-provision regular user account
        user = dataStore.createUser({
          fullName: isGoogleAuth
            ? cleanIdentifier.split("@")[0].replace(/[._]/g, " ").toUpperCase()
            : `User-${cleanIdentifier.slice(-4)}`,
          email: cleanIdentifier.includes("@") ? cleanIdentifier : undefined,
          phoneNumber: cleanIdentifier.replace(/\D/g, "") || "9876543210",
          role: "FARMER",
        });
      }

      const sessionToken = generateSessionToken();
      const sessionData = {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isAdmin: false,
        kycStatus: user.kycStatus,
        district: user.district,
        state: user.state,
        token: sessionToken,
      };

      const response = NextResponse.json(
        {
          success: true,
          user: sessionData,
          redirect: "/",
          remainingAttempts: rateLimit.remaining,
        },
        { headers: SECURITY_HEADERS }
      );

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
    }

    // 5. Standard Password Verification
    if (!password) {
      return NextResponse.json(
        { success: false, error: "Password is required for account sign-in." },
        { status: 400, headers: SECURITY_HEADERS }
      );
    }

    const verification = dataStore.verifyUserCredentials(cleanIdentifier, password);
    if (!verification.success || !verification.user) {
      return NextResponse.json(
        {
          success: false,
          error: verification.error || "Invalid email/mobile or password.",
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401, headers: SECURITY_HEADERS }
      );
    }

    const user = verification.user;
    const sessionToken = generateSessionToken();
    const sessionData = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      isAdmin: false,
      kycStatus: user.kycStatus,
      district: user.district,
      state: user.state,
      token: sessionToken,
    };

    const response = NextResponse.json(
      {
        success: true,
        user: sessionData,
        redirect: "/",
        remainingAttempts: rateLimit.remaining,
      },
      { headers: SECURITY_HEADERS }
    );

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
    console.error("Auth login API exception:", err);
    return NextResponse.json(
      { success: false, error: "Authentication service error. Please try again." },
      { status: 500, headers: SECURITY_HEADERS }
    );
  }
}
