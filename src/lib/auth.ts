/**
 * NAM-Core Authentication & Granular RBAC Manager
 * Enforces Google SSO, email_verified, allowlist checking, and role permissions.
 */

import { isPermittedEnterpriseDomain } from "./security";
export { isPermittedEnterpriseDomain };

export type AdminRole =
  | "SUPER_ADMIN"
  | "COMPLIANCE_OFFICER"
  | "MANDI_AUDITOR"
  | "DISPUTE_MANAGER";

export type UserRole = "FARMER" | "COMMERCIAL_BUYER" | "FPO_REPRESENTATIVE";

export interface GoogleAuthProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt: string;
}

export type AdminPermission =
  | "MANAGE_STAFF"
  | "OVERRIDE_FINANCIALS"
  | "REVIEW_KYC"
  | "REJECT_KYC"
  | "UPDATE_MANDI_PRICES"
  | "CALIBRATE_APMC"
  | "HANDLE_DISPUTES"
  | "AUDIT_COMMUNICATIONS"
  | "VIEW_AUDIT_LOGS";

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermission[]> = {
  SUPER_ADMIN: [
    "MANAGE_STAFF",
    "OVERRIDE_FINANCIALS",
    "REVIEW_KYC",
    "REJECT_KYC",
    "UPDATE_MANDI_PRICES",
    "CALIBRATE_APMC",
    "HANDLE_DISPUTES",
    "AUDIT_COMMUNICATIONS",
    "VIEW_AUDIT_LOGS",
  ],
  COMPLIANCE_OFFICER: ["REVIEW_KYC", "REJECT_KYC", "VIEW_AUDIT_LOGS"],
  MANDI_AUDITOR: ["UPDATE_MANDI_PRICES", "CALIBRATE_APMC", "VIEW_AUDIT_LOGS"],
  DISPUTE_MANAGER: [
    "HANDLE_DISPUTES",
    "AUDIT_COMMUNICATIONS",
    "VIEW_AUDIT_LOGS",
  ],
};

/**
 * Pre-allowlisted staff accounts for administrative access.
 * Only verified accounts present in this directory or possessing verified
 * official enterprise domain credentials can access the administrative core.
 */
export const PREDEFINED_ADMIN_STAFF: AdminSession[] = [
  {
    id: "admin-super-gaurav",
    email: "gaurav.verma.admin@gmail.com",
    name: "Gaurav Verma",
    role: "SUPER_ADMIN",
    isActive: true,
    lastLoginAt: new Date().toISOString(),
  },
];

/**
 * Checks if an admin role has a specific permission
 */
export function hasPermission(role: AdminRole, permission: AdminPermission): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}

/**
 * Validates Google OAuth user against allowlist and domain rules.
 * Rules:
 * 1. Must be verified (email_verified === true)
 * 2. Must match permitted enterprise domain or be in allowlisted AdminStaff table
 */
export function validateGoogleAdminAccess(
  profile: GoogleAuthProfile,
  staffList: AdminSession[] = PREDEFINED_ADMIN_STAFF
): {
  authorized: boolean;
  code?: "EMAIL_UNVERIFIED" | "ACCESS_FORBIDDEN" | "ACCOUNT_INACTIVE";
  staff?: AdminSession;
  message?: string;
} {
  if (!profile.email_verified) {
    return {
      authorized: false,
      code: "EMAIL_UNVERIFIED",
      message: "Google OAuth email must be verified. Unverified accounts cannot access NAM-Core.",
    };
  }

  const normalizedEmail = profile.email.toLowerCase().trim();

  // Find in staff list
  const staffMember = staffList.find(
    (s) => s.email.toLowerCase() === normalizedEmail
  );

  if (staffMember) {
    if (!staffMember.isActive) {
      return {
        authorized: false,
        code: "ACCOUNT_INACTIVE",
        message: "This administrative staff account has been deactivated by Super Admin.",
      };
    }
    return { authorized: true, staff: staffMember };
  }

  // If email belongs to verified enterprise domain (@yourorg.gov.in, @nam.gov.in)
  if (isPermittedEnterpriseDomain(normalizedEmail)) {
    // Dynamic provisioning for official domain emails
    const newStaff: AdminSession = {
      id: `admin-auto-${Date.now()}`,
      email: normalizedEmail,
      name: profile.name || "Government Official",
      role: "COMPLIANCE_OFFICER",
      isActive: true,
      lastLoginAt: new Date().toISOString(),
    };
    return { authorized: true, staff: newStaff };
  }

  // Otherwise return strict 403
  return {
    authorized: false,
    code: "ACCESS_FORBIDDEN",
    message: `Account ${normalizedEmail} is not allowlisted for NAM administrative access.`,
  };
}
