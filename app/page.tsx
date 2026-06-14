import Image from 'next/image';
import Link from 'next/link';
import { LogIn, UserPlus } from 'lucide-react';
import Navbar from './components/layout/Navbar';

const HERO_IMAGE = '/pondok.webp';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-emerald-950 text-white">
      <Navbar />

      <section className="relative min-h-screen overflow-hidden">
        <Image
          src={HERO_IMAGE}
          alt="Pondok Modern Shibghatallah"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />

        <div className="absolute inset-0 bg-emerald-950/65" />

        <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-5 pb-16 pt-32 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-emerald-100">
              Pendaftaran Santri Online
            </p>

            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Pendaftaran Santri Pondok Modern Shibghatallah
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50 sm:text-lg">
              Calon santri dapat membuat akun dan mengisi formulir pendaftaran
              secara online melalui sistem resmi Pondok Modern Shibghatallah.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/daftar-akun"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-primary shadow-sm transition hover:bg-emerald-50"
              >
                Daftar
                <UserPlus className="h-4 w-4" />
              </Link>

              <Link
                href="/masuk-akun"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                <LogIn className="h-4 w-4" />
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}