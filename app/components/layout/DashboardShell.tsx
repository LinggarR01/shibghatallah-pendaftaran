import type { AuthPayload, AuthRole } from '@/lib/auth';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

type DashboardShellProps = {
  role: AuthRole;
  user: AuthPayload;
  children: React.ReactNode;
};

export default function DashboardShell({
  role,
  user,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-surface text-text-main">
      <div className="grid min-h-screen lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <AppSidebar role={role} user={user} />
          </div>
        </div>

        <div className="min-w-0">
          <AppTopbar role={role} user={user} />
          <main className="mx-auto max-w-[1240px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
