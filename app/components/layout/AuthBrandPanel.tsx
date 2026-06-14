import { BookOpen, CheckCircle2, ShieldCheck } from 'lucide-react';

type AuthBrandPanelProps = {
  title: string;
  description: string;
};

export function AuthBrandPanel({ title, description }: AuthBrandPanelProps) {
  return (
    <div className="hidden min-h-[640px] overflow-hidden rounded-3xl border border-emerald-900/10 bg-primary text-white shadow-2xl shadow-emerald-950/15 lg:flex">
      <div className="relative flex w-full flex-col justify-between p-9">
        <div className="absolute inset-0 opacity-10 [background-image:linear-gradient(90deg,white_1px,transparent_1px),linear-gradient(180deg,white_1px,transparent_1px)] [background-size:42px_42px]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            <BookOpen className="h-4 w-4 text-accent-gold" />
            PSB Pondok Modern Shibghatallah
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-bold leading-tight tracking-tight">
            {title}
          </h1>
          <p className="mt-4 max-w-lg text-base leading-8 text-emerald-50/85">
            {description}
          </p>
        </div>

        <div className="relative grid gap-3">
          {[
            ['Aman dan resmi', 'Akses menggunakan akun terdaftar.'],
            ['Alur jelas', 'Isi data, unggah dokumen, lalu pantau status.'],
            ['Verifikasi rapi', 'Admin pondok dapat memberi catatan revisi.'],
          ].map(([label, text], index) => {
            const Icon = index === 0 ? ShieldCheck : CheckCircle2;

            return (
              <div
                key={label}
                className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                <div className="flex gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">{label}</p>
                    <p className="mt-1 text-sm leading-6 text-emerald-50/80">
                      {text}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
