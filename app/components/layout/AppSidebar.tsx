'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  ClipboardList,
  FileDown,
  FileText,
  Home,
  LayoutDashboard,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { AuthPayload, AuthRole } from '@/lib/auth';
import LogoutButton from '@/app/components/auth/LogoutButton';
import { Badge } from '@/app/components/ui/Badge';
import { Separator } from '@/app/components/ui/Separator';
import { cn } from '@/lib/cn';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const pendaftarNav: NavItem[] = [
  { href: '/dashboard/peserta', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pendaftar/formulir', label: 'Formulir', icon: FileText },
  { href: '/pendaftar/dokumen', label: 'Dokumen', icon: ClipboardList },
  { href: '/pendaftar/status', label: 'Status', icon: BarChart3 },
];

const adminNav: NavItem[] = [
  { href: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/pendaftar', label: 'Data Pendaftar', icon: ClipboardList },
  { href: '/admin/export', label: 'Laporan Export', icon: FileDown },
];

type AppSidebarProps = {
  role: AuthRole;
  user: AuthPayload;
  compact?: boolean;
  onNavigate?: () => void;
};

export function AppSidebar({ role, user, compact = false, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();
  const navItems = role === 'admin' ? adminNav : pendaftarNav;
  const roleLabel = role === 'admin' ? 'Admin' : 'Pendaftar';

  return (
    <aside
      className={cn(
        'flex h-full flex-col bg-white',
        compact ? 'px-5 pb-6' : 'border-r border-border-soft px-5 py-6',
      )}>
      <Link href="/" className="flex items-center gap-3" onClick={onNavigate}>
        <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-sm shadow-emerald-900/20">
          S
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent-gold ring-2 ring-white" />
        </span>
        <span>
          <span className="block text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Pondok Modern
          </span>
          <span className="block text-base font-bold text-text-main">
            Shibghatallah
          </span>
        </span>
      </Link>

      <div className="mt-7 rounded-2xl border border-border-soft bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            {roleLabel}
          </p>
          <Badge variant="gold">Aktif</Badge>
        </div>
        <p className="mt-3 truncate text-sm font-bold text-text-main">
          {user.nama}
        </p>
        <p className="mt-1 truncate text-xs text-text-muted">{user.email}</p>
      </div>

      <nav className="mt-6 space-y-1.5">
        {navItems.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== '/dashboard/admin' &&
              item.href !== '/dashboard/peserta' &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition',
                active
                  ? 'bg-primary text-white shadow-sm shadow-emerald-900/15'
                  : 'text-text-muted hover:bg-secondary hover:text-primary',
              )}>
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-xl transition',
                  active ? 'bg-white/15 text-white' : 'bg-surface text-primary group-hover:bg-white',
                )}>
                <item.icon className="h-4 w-4" />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-border-soft bg-white p-4 shadow-sm shadow-emerald-950/5">
        <div className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-[#8a6507]">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-bold text-text-main">PSB Online</p>
            <p className="mt-1 text-xs leading-5 text-text-muted">
              Data pendaftaran tersusun untuk proses verifikasi pondok.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-5">
        <Separator className="mb-4" />
        <Link
          href="/"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-text-muted transition hover:bg-surface hover:text-text-main">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface text-primary">
            <Home className="h-4 w-4" />
          </span>
          Beranda
        </Link>
        <LogoutButton />
      </div>
    </aside>
  );
}
