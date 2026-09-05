"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AdminRole, AdminSession, PREDEFINED_ADMIN_STAFF, hasPermission, AdminPermission } from "@/lib/auth";

interface AdminSessionContextType {
  currentSession: AdminSession | null;
  setSession: (session: AdminSession | null) => void;
  switchRoleAccount: (email: string) => void;
  simulateUnauthorizedLogin: () => void;
  can: (permission: AdminPermission) => boolean;
  logout: () => void;
}

const AdminSessionContext = createContext<AdminSessionContextType | undefined>(undefined);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  // Default to SUPER_ADMIN or load from localStorage
  const [currentSession, setCurrentSession] = useState<AdminSession | null>(PREDEFINED_ADMIN_STAFF[0]);

  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("nam_admin_active_email");
      if (savedEmail) {
        const found = PREDEFINED_ADMIN_STAFF.find((s) => s.email.toLowerCase() === savedEmail.toLowerCase());
        if (found) {
          setCurrentSession(found);
        }
      }
    } catch {
      // safe guard
    }
  }, []);

  const switchRoleAccount = (email: string) => {
    const found = PREDEFINED_ADMIN_STAFF.find((s) => s.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentSession(found);
      try {
        localStorage.setItem("nam_admin_active_email", found.email);
      } catch {
        // safe guard
      }
    }
  };

  const simulateUnauthorizedLogin = () => {
    // Triggers 403 Forbidden state
    setCurrentSession(null);
  };

  const logout = () => {
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
        setSession: setCurrentSession,
        switchRoleAccount,
        simulateUnauthorizedLogin,
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
