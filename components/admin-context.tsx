'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { AdminProfile } from '@/lib/types';

const AdminContext = createContext<AdminProfile | null>(null);

export function AdminProvider({ admin, children }: { admin: AdminProfile; children: ReactNode }) {
  return <AdminContext.Provider value={admin}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminProfile {
  const admin = useContext(AdminContext);
  if (!admin) {
    throw new Error('useAdmin() called outside of the authenticated dashboard layout.');
  }
  return admin;
}
