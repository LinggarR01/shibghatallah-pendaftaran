'use client';

import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset pesan
    setError('');
    setSuccessMessage('');

    // Validasi input
    if (!email.trim() || !password.trim()) {
      setError('Email dan password tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login gagal');
        setLoading(false);
        return;
      }

      // Login berhasil
      setSuccessMessage('Login berhasil! Mengalihkan...');
      setEmail('');
      setPassword('');

      // Redirect login biasa berdasarkan role.
      setTimeout(() => {
        window.location.assign(data.data?.redirectTo ?? '/');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      setError('Terjadi kesalahan pada server');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#F8F5EC] text-slate-800">
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-10">
        <div className="relative w-full max-w-md">
          {/* Card */}
          <div className="rounded-4xl border border-white/70 bg-white/85 p-6 shadow-2xl shadow-emerald-950/10 backdrop-blur sm:p-8">
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                Selamat Datang!
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600">
                Masuk ke akun untuk melanjutkan proses pendaftaran santri.
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
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-primary/10 disabled:bg-slate-50 disabled:text-slate-400"
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

              {/* Remember me */}
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  disabled={loading}
                  className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-emerald-600 disabled:opacity-50"
                />
                Ingat saya
              </label>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:bg-emerald-400 disabled:cursor-not-allowed">
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Belum punya akun?{' '}
              <Link
                href="/daftar-akun"
                className="font-semibold text-primary transition hover:text-emerald-800">
                Daftar
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-6 text-slate-500">
            Gunakan akun yang telah terdaftar untuk mengakses sistem pendaftaran
            online Pondok Pesantren Shibgotalloh.
          </p>
        </div>
      </section>
    </main>
  );
}
