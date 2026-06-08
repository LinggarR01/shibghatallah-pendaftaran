import Link from 'next/link';

export default function Navbar() {
  return (
    <header className="border-b border-emerald-900/10 bg-[#F8F5EC]/90 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="#" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white shadow-sm">
            S
          </div>

          <div>
            <p className="text-sm font-semibold leading-none text-emerald-800">
              Pendaftaran Online
            </p>
            <h1 className="text-base font-bold tracking-tight text-slate-950">
              Shibgotalloh
            </h1>
          </div>
        </Link>
      </nav>
    </header>
  );
}
