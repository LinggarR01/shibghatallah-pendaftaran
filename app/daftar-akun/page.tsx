'use client';

import Image from 'next/image';
import { Eye, EyeOff, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { toast } from '@/app/components/ui/Toast';

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

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset pesan
    setError('');
    setSuccessMessage('');

    // Validasi manual
    if (!nama.trim()) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (!email.trim()) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (!email.includes('@')) {
      showError('Format email tidak valid.');
      return;
    }

    if (!noHp.trim()) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (!password) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (!konfirmasiPassword) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (password.length < 8) {
      showError('Password minimal 8 karakter.');
      return;
    }

    if (password !== konfirmasiPassword) {
      showError('Konfirmasi password tidak sama.');
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
        const message =
          data.message?.toLowerCase().includes('email')
            ? 'Email sudah terdaftar.'
            : data.message || 'Terjadi kesalahan. Silakan coba lagi.';
        showError(message);
        setLoading(false);
        return;
      }

      // Success
      const message = data.message || 'Akun berhasil dibuat.';
      setSuccessMessage(message);
      toast.success(message);
      setNama('');
      setEmail('');
      setNoHp('');
      setPassword('');
      setKonfirmasiPassword('');

      router.replace(data.data?.redirectTo ?? '/pendaftar/formulir');
      router.refresh();
    } catch (err) {
      console.error('Register error:', err);
      showError('Terjadi kesalahan. Silakan coba lagi.');
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
                  Buat Akun Pendaftar
                </h2>
                <p className="mt-3 text-sm leading-6 text-text-muted">
                  Akun ini digunakan untuk mengisi formulir dan memantau
                  verifikasi pendaftaran santri.
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
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="nama" className="mb-2 block">
                      Nama lengkap
                    </Label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <Input
                        id="nama"
                        name="nama"
                        type="text"
                        required
                        placeholder="Masukkan nama lengkap"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="whatsapp" className="mb-2 block">
                      Nomor WhatsApp
                    </Label>
                    <div className="relative">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        type="tel"
                        required
                        inputMode="tel"
                        placeholder="081234567890"
                        value={noHp}
                        onChange={(e) => setNoHp(e.target.value)}
                        disabled={loading}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <PasswordField
                    id="password"
                    label="Password"
                    value={password}
                    show={showPassword}
                    setShow={setShowPassword}
                    onChange={setPassword}
                    disabled={loading}
                    placeholder="Minimal 8 karakter"
                  />
                  <PasswordField
                    id="confirmPassword"
                    label="Konfirmasi password"
                    value={konfirmasiPassword}
                    show={showKonfirmasiPassword}
                    setShow={setShowKonfirmasiPassword}
                    onChange={setKonfirmasiPassword}
                    disabled={loading}
                    placeholder="Ulangi password"
                    invalid={isPasswordNotMatch}
                  />
                </div>

                {isPasswordNotMatch && (
                  <p className="text-sm text-red-600">
                    Konfirmasi password harus sama dengan password.
                  </p>
                )}

                {isPasswordMatch && (
                  <p className="text-sm font-semibold text-primary">
                    Password sudah sesuai.
                  </p>
                )}

                <label className="flex items-start gap-3 text-sm leading-6 text-text-muted">
                  <input
                    type="checkbox"
                    required
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-border-soft text-primary focus:ring-primary disabled:opacity-50"
                  />
                  <span>
                    Saya menyetujui syarat dan ketentuan pendaftaran santri
                    Pondok Pesantren Shibgotalloh.
                  </span>
                </label>

                <Button
                  type="submit"
                  disabled={isPasswordNotMatch || loading}
                  className="w-full"
                  size="lg">
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-text-muted">
                Sudah punya akun?{' '}
                <Link
                  href="/masuk-akun"
                  className="font-semibold text-primary hover:text-primary-hover">
                  Masuk
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

function PasswordField({
  id,
  label,
  value,
  show,
  setShow,
  onChange,
  disabled,
  placeholder,
  invalid = false,
}: {
  id: string;
  label: string;
  value: string;
  show: boolean;
  setShow: (value: boolean) => void;
  onChange: (value: string) => void;
  disabled: boolean;
  placeholder: string;
  invalid?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-2 block">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          type={show ? 'text' : 'password'}
          required
          minLength={8}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={`pr-11 ${invalid ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          disabled={disabled}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted transition hover:text-primary disabled:opacity-50"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
