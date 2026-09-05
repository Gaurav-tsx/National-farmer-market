"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminRole, AdminSession, PREDEFINED_ADMIN_STAFF, hasPermission, AdminPermission, isPermittedEnterpriseDomain } from "@/lib/auth";
import { createClient } from "@/utils/supabase/client";

interface AdminSessionContextType {
  currentSession: AdminSession | null;
  loading: boolean;
  setSession: (session: AdminSession | null) => void;
  loginWithStaffEmail: (email: string) => Promise<{ success: boolean; role?: AdminRole; message?: string }>;
  can: (permission: AdminPermission) => boolean;
  logout: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  // MUST start as null so unauthorized visitors are never granted automatic access
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check Supabase Auth user or saved verified session on mount
  useEffect(() => {
    async function checkAuthSession() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user && user.email) {
          const userEmail = user.email.toLowerCase().trim();
          // Check against allowlisted staff
          const match = PREDEFINED_ADMIN_STAFF.find(
            (s) => s.email.toLowerCase() === userEmail
          );

          if (match) {
            setCurrentSession(match);
          } else if (isPermittedEnterpriseDomain(userEmail)) {
            setCurrentSession({
              id: `admin-${user.id}`,
              email: userEmail,
              name: user.user_metadata?.full_name || "Government Official",
              role: "COMPLIANCE_OFFICER",
              isActive: true,
              lastLoginAt: new Date().toISOString(),
            });
          }
        } else {
          // Check saved session in localStorage
          const savedEmail = localStorage.getItem("nam_admin_active_email");
          if (savedEmail) {
            const found = PREDEFINED_ADMIN_STAFF.find(
              (s) => s.email.toLowerCase() === savedEmail.toLowerCase()
            );
            if (found) {
              setCurrentSession(found);
            }
          }
        }
      } catch {
        // Auth check fallback
      } finally {
        setLoading(false);
      }
    }

    checkAuthSession();
  }, []);

  const loginWithStaffEmail = async (email: string): Promise<{ success: boolean; role?: AdminRole; message?: string }> => {
    const normalized = email.toLowerCase().trim();

    // Find in allowlisted staff list
    const found = PREDEFINED_ADMIN_STAFF.find(
      (s) => s.email.toLowerCase() === normalized
    );

    if (found) {
      if (!found.isActive) {
        return { success: false, message: "Staff account has been deactivated." };
      }
      setCurrentSession(found);
      try {
        localStorage.setItem("nam_admin_active_email", found.email);
      } catch {
        // safe guard
      }
      return { success: true, role: found.role };
    }

    // Check enterprise government domain
    if (isPermittedEnterpriseDomain(normalized)) {
      const newSession: AdminSession = {
        id: `admin-${Date.now()}`,
        email: normalized,
        name: "Government Official",
        role: "COMPLIANCE_OFFICER",
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };
      setCurrentSession(newSession);
      try {
        localStorage.setItem("nam_admin_active_email", newSession.email);
      } catch {
        // safe guard
      }
      return { success: true, role: newSession.role };
    }

    return {
      success: false,
      message: `Account "${normalized}" is not allowlisted in the NAM administrative directory. Access Forbidden (403).`,
    };
  };

  const logout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // safe guard
    }
    setCurrentSession(null);
    try {
      localStorage.removeItem("nam_admin_active_email");
    } catch {
      // safe guard
    }
  };

  const can = (permission: AdminPermission): boolean => {
    if (!currentSession) return false;
    return hasPermission(currentSession.role, permission);
  };

  return (
    <AdminSessionContext.Provider
      value={{
        currentSession,
        loading,
        setSession: setCurrentSession,
        loginWithStaffEmail,
        can,
        logout,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error("useAdminSession must be used within an AdminSessionProvider");
  }
  return context;
}
