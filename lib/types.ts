export type AdminRole = 'SUPER_ADMIN' | 'COMPLIANCE_OFFICER' | 'FINANCE_OFFICER' | 'SUPPORT_AGENT';

export interface AdminProfile {
<<<<<<< HEAD
=======
  id: string;
>>>>>>> cc343e15 (Upgrade to v8 commit)
  adminId: string;
  name: string;
  email: string;
  role: AdminRole;
<<<<<<< HEAD
=======
  photoUrl?: string | null;
  phone?: string | null;
  bio?: string | null;
  twoFactorEnabled?: boolean;
  lastLoginAt?: string | null;
  createdAt?: string;
>>>>>>> cc343e15 (Upgrade to v8 commit)
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  FINANCE_OFFICER: 'Finance Officer',
  SUPPORT_AGENT: 'Support Agent',
};
