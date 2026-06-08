import { redirect } from 'next/navigation';
import DashboardShell from '@/app/components/layout/DashboardShell';
import { getAuthUser } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect('/masuk-akun');
  }

  return (
    <DashboardShell role={authUser.peran} user={authUser}>
      {children}
    </DashboardShell>
  );
}
