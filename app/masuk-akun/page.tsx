'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react';
import { useState } from 'react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { toast } from '@/app/components/ui/Toast';

export default function LoginPage() {
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
      const message = 'Mohon lengkapi data yang wajib diisi.';
      setError(message);
      toast.warning(message);
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
        const message = data.message || 'Email atau password salah.';
        setError(message);
        toast.error(message);
        setLoading(false);
        return;
      }

      // Login berhasil
      const message = 'Login berhasil. Mengalihkan...';
      setSuccessMessage(message);
      toast.success(message);
      setEmail('');
      setPassword('');

      // Redirect login biasa berdasarkan role.
      setTimeout(() => {
        window.location.assign(data.data?.redirectTo ?? '/');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      const message = 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
      toast.error(message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface text-text-main">
      <section className="flex min-h-screen items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <div className="mb-7 text-center">
                <Image
                  src="/logo.webp"
                  alt="Logo Pondok Modern Shibghatallah"
                  width={64}
                  height={64}
                  className="mx-auto h-16 w-16 object-contain"
                  priority
                />
                <h2 className="mt-5 text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                  Masuk ke Akun Pendaftaran
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  Masuk untuk melanjutkan proses pendaftaran santri Pondok
                  Modern Shibghatallah.
                </p>
              </div>

              {error && (
                <Alert variant="destructive" className="mb-5">
                  {error}
                </Alert>
              )}

              {successMessage && (
                <Alert variant="success" className="mb-5">
                  {successMessage}
                </Alert>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Masukkan password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-primary disabled:opacity-50"
                      aria-label={
                        showPassword
                          ? 'Sembunyikan password'
                          : 'Tampilkan password'
                      }>
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-sm text-text-muted">
                  <input
                    type="checkbox"
                    disabled={loading}
                    className="h-4 w-4 rounded border-border-soft text-primary focus:ring-primary disabled:opacity-50"
                  />
                  Ingat saya
                </label>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full"
                  size="lg">
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-muted">
                Belum punya akun?{' '}
                <Link
                  href="/daftar-akun"
                  className="font-semibold text-primary transition hover:text-primary-hover">
                  Daftar akun
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
