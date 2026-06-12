import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  FileDown,
  FileText,
  Home,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react';
import type { AuthPayload, AuthRole } from '@/lib/auth';
import LogoutButton from '@/app/components/auth/LogoutButton';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const pendaftarNav: NavItem[] = [
  { href: '/dashboard/peserta', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pendaftar/formulir', label: 'Formulir Pendaftaran', icon: FileText },
  { href: '/pendaftar/dokumen', label: 'Dokumen', icon: ClipboardList },
  { href: '/pendaftar/status', label: 'Status Pendaftaran', icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pendaftar', label: 'Data Pendaftar', icon: ClipboardList },
  { href: '/admin/export', label: 'Export Data', icon: FileDown },
];

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
  const navItems = role === 'admin' ? adminNav : pendaftarNav;
  const roleLabel = role === 'admin' ? 'Admin' : 'Pendaftar';

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-slate-800">
      <div className="border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-bold text-white">
              S
            </span>
            <span className="text-sm font-bold text-slate-950">
              Shibgotalloh
            </span>
          </Link>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {roleLabel}
          </span>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-3">
          {navItems.map((item: NavItem) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-0 flex h-screen flex-col px-5 py-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-lg font-bold text-white">
                S
              </span>
              <span>
                <span className="block text-xs font-semibold uppercase text-emerald-700">
                  Pendaftaran Online
                </span>
                <span className="block text-base font-bold text-slate-950">
                  Shibgotalloh
                </span>
              </span>
            </Link>

            <div className="mt-8 rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                {roleLabel}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950">
                {user.nama}
              </p>
              <p className="mt-1 truncate text-xs text-slate-500">
                {user.email}
              </p>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item: NavItem) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-800">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 pt-4">
              <Link
                href="/"
                className="mb-1 flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-950">
                <Home className="h-4 w-4" />
                Beranda
              </Link>
              <LogoutButton />
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
