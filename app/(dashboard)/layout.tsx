import { redirect } from 'next/navigation';
import { backendFetch, BackendError } from '@/lib/api';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { AdminProvider } from '@/components/admin-context';
import type { AdminProfile } from '@/lib/types';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let admin: AdminProfile;
  try {
    admin = await backendFetch('/admin-auth/me');
  } catch (error) {
    if (error instanceof BackendError && (error.status === 401 || error.status === 403)) {
      redirect('/login');
    }
    // Backend unreachable — still send to login rather than rendering a
    // broken authenticated shell with no data behind it.
    redirect('/login');
  }

  return (
    <AdminProvider admin={admin}>
      <div className="flex min-h-screen">
        <Sidebar role={admin.role} />
        <div className="flex flex-1 flex-col">
          <Topbar admin={admin} />
          <main className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
