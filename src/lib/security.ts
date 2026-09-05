import { createHash, randomBytes } from "crypto";

const PEPPER = process.env.KYC_SECURITY_PEPPER || "nam_core_pepper_salt_bharat_2026_x99";

/**
 * Creates an irreversible cryptographic hash of sensitive identifiers (Aadhaar XML, PAN)
 * NEVER store cleartext government identification numbers.
 */
export function hashGovernmentId(rawId: string): string {
  const normalized = rawId.trim().toUpperCase();
  return createHash("sha256")
    .update(`${PEPPER}:${normalized}:${PEPPER}`)
    .digest("hex");
}

/**
 * Returns a masked identifier for user interface display.
 * Aadhaar: XXXX-XXXX-4819
 * PAN: XXXXX4819F
 */
export function maskIdentifier(rawId: string, docType: "AADHAAR_XML" | "PAN" | "UDYAM"): string {
  const clean = rawId.replace(/[\s-]/g, "").toUpperCase();
  if (docType === "AADHAAR_XML") {
    const last4 = clean.slice(-4) || "0000";
    return `XXXX-XXXX-${last4}`;
  } else if (docType === "PAN") {
    if (clean.length === 10) {
      return `XXXXX${clean.slice(5, 9)}${clean.slice(9)}`;
    }
    return `XXXXX${clean.slice(-4)}`;
  } else {
    // UDYAM
    return `UDYAM-XX-XXXX-${clean.slice(-4) || "0000"}`;
  }
}

/**
 * Generates a mock DigiLocker transaction reference token
 */
export function generateDigiLockerTxRef(): string {
  const randomHex = randomBytes(6).toString("hex").toUpperCase();
  const year = new Date().getFullYear();
  return `DL-IND-${year}-${randomHex}`;
}

/**
 * Validates whether an email belongs to the permitted enterprise domain
 */
export function isPermittedEnterpriseDomain(email: string): boolean {
  const normalized = email.toLowerCase().trim();
  return (
    normalized.endsWith("@yourorg.gov.in") ||
    normalized.endsWith("@nam.gov.in") ||
    normalized.endsWith("@agri.gov.in")
  );
}

/**
 * Security headers for high-concurrency API route responses
 */
export const SECURITY_HEADERS = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(self)",
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

/**
 * Creates a salted hash for passwords
 */
export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha256")
    .update(`${salt}:${password}:${PEPPER}`)
    .digest("hex");
  return { hash, salt };
}

/**
 * Verifies a password against a stored salted hash
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const computed = createHash("sha256")
    .update(`${salt}:${password}:${PEPPER}`)
    .digest("hex");
  return computed === storedHash;
}

/**
 * Generates an opaque session token
 */
export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

