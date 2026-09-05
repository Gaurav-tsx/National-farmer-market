"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AdminRole, AdminSession, PREDEFINED_ADMIN_STAFF, hasPermission, AdminPermission, isPermittedEnterpriseDomain } from "@/lib/auth";
import { createClient } from "@/utils/supabase/client";

export interface UserSession {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  role: AdminRole | "FARMER" | "COMMERCIAL_BUYER" | "FPO_REPRESENTATIVE";
  isAdmin: boolean;
  kycStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  token?: string;
  district?: string;
  state?: string;
  createdAt?: string;
}


interface AdminSessionContextType {
  userSession: UserSession | null;
  currentSession: AdminSession | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  setUserSession: (session: UserSession | null) => void;
  setSession: (session: AdminSession | null) => void;
  loginWithStaffEmail: (email: string) => Promise<{ success: boolean; role?: AdminRole; message?: string }>;
  can: (permission: AdminPermission) => boolean;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [userSession, setUserSessionState] = useState<UserSession | null>(null);
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const applyAdminSessionForEmail = useCallback((email: string, name?: string) => {
    const normalized = email.toLowerCase().trim();
    const match = PREDEFINED_ADMIN_STAFF.find((s) => s.email.toLowerCase() === normalized);
    if (match) {
      setCurrentSession(match);
      return match;
    } else if (isPermittedEnterpriseDomain(normalized)) {
      const govSession: AdminSession = {
        id: `admin-gov-${Date.now()}`,
        email: normalized,
        name: name || "Government Official",
        role: "COMPLIANCE_OFFICER",
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };
      setCurrentSession(govSession);
      return govSession;
    }
    return null;
  }, []);

  const setUserSession = useCallback(
    (session: UserSession | null) => {
      setUserSessionState(session);
      if (session) {
        try {
          localStorage.setItem("nfm_user_session", JSON.stringify(session));
        } catch {
          // safe guard
        }
        if (session.isAdmin || (session.email && (session.email.toLowerCase() === "gaurav.verma.admin@gmail.com" || isPermittedEnterpriseDomain(session.email)))) {
          applyAdminSessionForEmail(session.email || "gaurav.verma.admin@gmail.com", session.fullName);
        } else {
          setCurrentSession(null);
        }
      } else {
        try {
          localStorage.removeItem("nfm_user_session");
          localStorage.removeItem("nam_admin_active_email");
        } catch {
          // safe guard
        }
        setCurrentSession(null);
      }
    },
    [applyAdminSessionForEmail]
  );

  const refreshSession = useCallback(async () => {
    try {
      // 1. Check /api/auth/session endpoint
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.authenticated && json.user) {
          setUserSession(json.user);
          return;
        }
      }

      // 2. Check localStorage
      const local = localStorage.getItem("nfm_user_session");
      if (local) {
        try {
          const parsed = JSON.parse(local) as UserSession;
          if (parsed && parsed.id) {
            setUserSession(parsed);
            return;
          }
        } catch {
          // parse error
        }
      }

      // 3. Fallback: Check admin email legacy
      const adminEmail = localStorage.getItem("nam_admin_active_email");
      if (adminEmail) {
        const admin = applyAdminSessionForEmail(adminEmail);
        if (admin) {
          setUserSessionState({
            id: admin.id,
            fullName: admin.name,
            email: admin.email,
            role: admin.role,
            isAdmin: true,
            kycStatus: "VERIFIED",
          });
          return;
        }
      }

      // 4. Supabase auth check
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        const email = data.user.email.toLowerCase();
        const isAdminUser = email === "gaurav.verma.admin@gmail.com" || isPermittedEnterpriseDomain(email);
        const newSession: UserSession = {
          id: data.user.id,
          fullName: data.user.user_metadata?.full_name || email.split("@")[0],
          email,
          role: isAdminUser ? "SUPER_ADMIN" : "FARMER",
          isAdmin: isAdminUser,
          kycStatus: isAdminUser ? "VERIFIED" : "UNVERIFIED",
        };
        setUserSession(newSession);
      } else {
        setUserSessionState(null);
        setCurrentSession(null);
      }
    } catch (err) {
      console.warn("Session refresh error:", err);
    } finally {
      setLoading(false);
    }
  }, [setUserSession, applyAdminSessionForEmail]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const loginWithStaffEmail = async (email: string): Promise<{ success: boolean; role?: AdminRole; message?: string }> => {
    const normalized = email.toLowerCase().trim();

    const found = PREDEFINED_ADMIN_STAFF.find((s) => s.email.toLowerCase() === normalized);
    if (found) {
      if (!found.isActive) {
        return { success: false, message: "Staff account has been deactivated." };
      }
      setCurrentSession(found);
      const sessionUser: UserSession = {
        id: found.id,
        fullName: found.name,
        email: found.email,
        role: found.role,
        isAdmin: true,
        kycStatus: "VERIFIED",
      };
      setUserSession(sessionUser);
      return { success: true, role: found.role };
    }

    if (isPermittedEnterpriseDomain(normalized)) {
      const newStaff: AdminSession = {
        id: `admin-${Date.now()}`,
        email: normalized,
        name: "Government Official",
        role: "COMPLIANCE_OFFICER",
        isActive: true,
        lastLoginAt: new Date().toISOString(),
      };
      setCurrentSession(newStaff);
      const sessionUser: UserSession = {
        id: newStaff.id,
        fullName: newStaff.name,
        email: newStaff.email,
        role: newStaff.role,
        isAdmin: true,
        kycStatus: "VERIFIED",
      };
      setUserSession(sessionUser);
      return { success: true, role: newStaff.role };
    }

    return {
      success: false,
      message: `Account "${normalized}" is not allowlisted in the NAM administrative directory. Access Forbidden (403).`,
    };
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // safe guard
    }
    setUserSession(null);
  };

  const can = (permission: AdminPermission): boolean => {
    if (!currentSession) return false;
    return hasPermission(currentSession.role, permission);
  };

  const isAdmin = Boolean(userSession?.isAdmin || currentSession);
  const isAuthenticated = Boolean(userSession);

  return (
    <AdminSessionContext.Provider
      value={{
        userSession,
        currentSession,
        loading,
        isAdmin,
        isAuthenticated,
        setUserSession,
        setSession: setCurrentSession,
        loginWithStaffEmail,
        can,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionContextType {
  const context = useContext(AdminSessionContext);
  if (!context) {
    return {
      userSession: null,
      currentSession: null,
      loading: false,
      isAdmin: false,
      isAuthenticated: false,
      setUserSession: () => {},
      setSession: () => {},
      loginWithStaffEmail: async () => ({
        success: false,
        message: "Authentication session initializing...",
      }),
      can: () => false,
      logout: async () => {},
      refreshSession: async () => {},
    };
  }
  return context;
}
