'use client';

import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, UserRound } from 'lucide-react';
import type { AuthPayload, AuthRole } from '@/lib/auth';
import LogoutButton from '@/app/components/auth/LogoutButton';
import { AppSidebar } from './AppSidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/components/ui/DropdownMenu';
import { Separator } from '@/app/components/ui/Separator';
import { Sheet, SheetContent } from '@/app/components/ui/Sheet';

type AppTopbarProps = {
  role: AuthRole;
  user: AuthPayload;
};

function getTitle(pathname: string) {
  if (pathname === '/dashboard/admin') return 'Dashboard Admin';
  if (pathname === '/dashboard/peserta') return 'Dashboard Pendaftar';
  if (pathname === '/admin/pendaftar') return 'Data Pendaftar';
  if (pathname.startsWith('/admin/pendaftar/')) return 'Detail Pendaftar';
  if (pathname === '/admin/export') return 'Laporan Export';
  if (pathname === '/pendaftar/formulir') return 'Formulir Pendaftaran';
  if (pathname === '/pendaftar/dokumen') return 'Dokumen Pendaftaran';
  if (pathname === '/pendaftar/status') return 'Status Pendaftaran';
  return 'Pendaftaran Santri';
}

function getDescription(pathname: string, role: AuthRole) {
  if (pathname.includes('/admin/pendaftar')) {
    return 'Kelola data santri dan proses verifikasi dengan rapi.';
  }
  if (pathname.includes('/formulir')) {
    return 'Lengkapi data calon santri sesuai dokumen resmi.';
  }
  if (pathname.includes('/dokumen')) {
    return 'Unggah dan pantau dokumen pendukung pendaftaran.';
  }
  return role === 'admin'
    ? 'Ringkasan operasional penerimaan santri baru.'
    : 'Pantau proses pendaftaran santri Anda.';
}

export function AppTopbar({ role, user }: AppTopbarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const title = useMemo(() => getTitle(pathname), [pathname]);
  const description = useMemo(() => getDescription(pathname, role), [pathname, role]);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border-soft bg-white/90 backdrop-blur">
        <div className="flex min-h-20 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-border-soft bg-white text-primary shadow-sm lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Buka menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight text-text-main sm:text-xl">
                {title}
              </p>
              <p className="mt-1 hidden truncate text-sm text-text-muted sm:block">
                {description}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-3 rounded-2xl border border-border-soft bg-white px-3 py-2 text-left shadow-sm transition hover:bg-surface">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
                <UserRound className="h-4 w-4" />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block max-w-36 truncate text-sm font-bold text-text-main">
                  {user.nama}
                </span>
                <span className="block max-w-36 truncate text-xs text-text-muted">
                  {role === 'admin' ? 'Admin Pondok' : 'Pendaftar'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-text-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <p className="font-semibold text-text-main">{user.nama}</p>
                <p className="mt-1 truncate text-xs text-text-muted">{user.email}</p>
              </DropdownMenuItem>
              <Separator className="my-2" />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent onClose={() => setMobileOpen(false)}>
          <AppSidebar
            role={role}
            user={user}
            compact
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
