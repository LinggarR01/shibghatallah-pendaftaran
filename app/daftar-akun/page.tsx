'use client';

import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type RegisterResponse = {
  success: boolean;
  message: string;
  data?: {
    id: string;
    nama: string;
    email: string;
    noHp?: string | null;
    peran: 'admin' | 'pendaftar';
    redirectTo?: string;
  };
};

export default function RegisterPage() {
  const router = useRouter();

  // Form states
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [noHp, setNoHp] = useState('');
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showKonfirmasiPassword, setShowKonfirmasiPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check password match
  const isPasswordMatch =
    konfirmasiPassword.length > 0 && password === konfirmasiPassword;

  const isPasswordNotMatch =
    konfirmasiPassword.length > 0 && password !== konfirmasiPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset pesan
    setError('');
    setSuccessMessage('');

    // Validasi manual
    if (!nama.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }

    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    if (!noHp.trim()) {
      setError('Nomor WhatsApp wajib diisi');
      return;
    }

    if (!password) {
      setError('Password wajib diisi');
      return;
    }

    if (!konfirmasiPassword) {
      setError('Konfirmasi password wajib diisi');
      return;
    }

    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    if (password !== konfirmasiPassword) {
      setError('Password dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          nama: nama.trim(),
          email: email.trim().toLowerCase(),
          noHp: noHp.trim(),
          password,
          konfirmasiPassword,
        }),
      });

      const data: RegisterResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Registrasi gagal');
        setLoading(false);
        return;
      }

      // Success
      setSuccessMessage(data.message || 'Registrasi berhasil!');
      setNama('');
      setEmail('');
      setNoHp('');
      setPassword('');
      setKonfirmasiPassword('');

      router.replace(data.data?.redirectTo ?? '/pendaftar/formulir');
      router.refresh();
    } catch (err) {
      console.error('Register error:', err);
      setError('Terjadi kesalahan pada server');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F5EC] text-slate-800">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="relative w-full max-w-md">
          <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-8">
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Silahkan Daftar Akun!
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Buat akun terlebih dahulu untuk melanjutkan proses pendaftaran
                santri.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <p className="text-sm text-emerald-700">{successMessage}</p>
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="nama"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </label>
                <input
                  id="nama"
                  name="nama"
                  type="text"
                  required
                  placeholder="Masukkan nama lengkap"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="whatsapp"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Nomor WhatsApp
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  inputMode="tel"
                  placeholder="Contoh: 081234567890"
                  value={noHp}
                  onChange={(e) => setNoHp(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Minimal 8 karakter"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword
                        ? 'Sembunyikan password'
                        : 'Tampilkan password'
                    }>
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Konfirmasi password
                </label>

                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showKonfirmasiPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={konfirmasiPassword}
                    onChange={(e) => setKonfirmasiPassword(e.target.value)}
                    disabled={loading}
                    placeholder="Ulangi password"
                    className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:ring-4 ${
                      isPasswordNotMatch
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                        : 'border-slate-200 focus:border-emerald-600 focus:ring-primary/10'
                    } disabled:bg-slate-50 disabled:text-slate-400`}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowKonfirmasiPassword(!showKonfirmasiPassword)
                    }
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={
                      showKonfirmasiPassword
                        ? 'Sembunyikan konfirmasi password'
                        : 'Tampilkan konfirmasi password'
                    }>
                    {showKonfirmasiPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>

                {isPasswordNotMatch && (
                  <p className="mt-2 text-sm text-red-600">
                    Konfirmasi password harus sama dengan password.
                  </p>
                )}

                {isPasswordMatch && (
                  <p className="mt-2 text-sm text-primary">
                    Password sudah sesuai.
                  </p>
                )}
              </div>

              <label className="flex items-start gap-3 text-sm leading-6 text-slate-600">
                <input
                  type="checkbox"
                  required
                  disabled={loading}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-emerald-600 disabled:opacity-50"
                />
                <span>
                  Saya menyetujui syarat dan ketentuan pendaftaran santri Pondok
                  Pesantren Shibgotalloh.
                </span>
              </label>

              <button
                type="submit"
                disabled={isPasswordNotMatch || loading}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none">
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Sudah punya akun?{' '}
              <Link
                href="/masuk-akun"
                className="font-semibold text-primary hover:text-emerald-800">
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
