import Link from 'next/link';
import Image from 'next/image';
import { LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <nav className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl border border-white/25 bg-white/20 px-5 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/30 bg-white/40 shadow-sm backdrop-blur-md">
            <Image
              src="/logo.webp"
              alt="Logo Pondok Modern Shibghatallah"
              width={44}
              height={44}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="text-sm font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-base">
              Pondok Modern Shibghatallah
            </h1>
            <p className="mt-1 text-xs font-semibold text-emerald-100 drop-shadow-sm">
              Pendaftaran Santri
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-2 sm:flex">
  <Link
    href="/masuk-akun"
    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-primary bg-white px-4 text-sm font-semibold text-primary shadow-sm transition hover:bg-emerald-50"
  >
    <LogIn className="h-4 w-4" />
    Masuk
  </Link>

  <Link
    href="/daftar-akun"
    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-hover"
  >
    <UserPlus className="h-4 w-4" />
    Daftar
  </Link>
</div>
      </nav>
    </header>
  );
}