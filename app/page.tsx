import Link from 'next/link';
import Navbar from './components/layout/Navbar';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F5EC] text-slate-800">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto flex min-h-[calc(100vh-73px)] max-w-7xl items-center justify-center px-5 py-14 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Pendaftaran Online Pondok Pesantren Shibgotalloh
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              Daftarkan calon santri dengan mudah, cepat, dan aman melalui
              sistem pendaftaran online resmi Pondok Pesantren Shibgotalloh.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/daftar-akun"
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800">
                Daftar
              </Link>

              <Link
                href="/masuk-akun"
                className="inline-flex items-center justify-center rounded-full border border-primary bg-white/70 px-8 py-3 text-base font-semibold text-primary transition hover:bg-emerald-50">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
