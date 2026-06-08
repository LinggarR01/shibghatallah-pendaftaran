import { redirect } from 'next/navigation';
import DashboardShell from '@/app/components/layout/DashboardShell';
import { getAuthUser } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function PendaftarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  if (authUser.peran !== 'pendaftar') {
    redirect('/dashboard/admin');
  }

  return (
    <DashboardShell role="pendaftar" user={authUser}>
      {children}
    </DashboardShell>
  );
}
