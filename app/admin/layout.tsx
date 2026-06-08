import { redirect } from 'next/navigation';
import DashboardShell from '@/app/components/layout/DashboardShell';
import { getAuthUser } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  if (authUser.peran !== 'admin') {
    redirect('/dashboard/peserta');
  }

  return (
    <DashboardShell role="admin" user={authUser}>
      {children}
    </DashboardShell>
  );
}
