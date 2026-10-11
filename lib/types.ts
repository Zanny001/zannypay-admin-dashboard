export type AdminRole = 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'FINANCE_OFFICER' | 'SUPPORT_AGENT';

export interface AdminProfile {
  id: string;
  adminId: string;
  name: string;
  email: string;
  role: AdminRole;
  photoUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  FINANCE_OFFICER: 'Finance Officer',
  SUPPORT_AGENT: 'Support Agent',
};
