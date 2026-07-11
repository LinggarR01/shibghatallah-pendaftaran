'use client';

import Link from 'next/link';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Eye, EyeOff, Save, X } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { Separator } from '@/app/components/ui/Separator';
import { toast } from '@/app/components/ui/Toast';

type ChangePasswordFormProps = {
  backHref: string;
};

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type VisiblePasswordState = Record<keyof FormState, boolean>;

type ApiPayload = {
  success: boolean;
  message?: string;
};

const initialForm: FormState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const initialVisibility: VisiblePasswordState = {
  currentPassword: false,
  newPassword: false,
  confirmPassword: false,
};

export default function ChangePasswordForm({
  backHref,
}: ChangePasswordFormProps) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [visible, setVisible] =
    useState<VisiblePasswordState>(initialVisibility);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggleVisibility(field: keyof FormState) {
    setVisible((current) => ({ ...current, [field]: !current[field] }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showError('Mohon lengkapi data yang wajib diisi.');
      return;
    }

    if (form.newPassword.length < 8) {
      showError('Password baru minimal 8 karakter.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showError('Konfirmasi password tidak sama.');
      return;
    }

    if (form.currentPassword === form.newPassword) {
      showError('Password baru tidak boleh sama dengan password lama.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiPayload;

      if (!response.ok) {
        showError(payload.message || 'Terjadi kesalahan. Silakan coba lagi.');
        return;
      }

      setForm(initialForm);
      const successMessage = payload.message || 'Password berhasil diubah.';
      setMessage(successMessage);
      toast.success(successMessage);
    } catch {
      showError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Ganti Password</CardTitle>
        <CardDescription>
          Gunakan password yang kuat dan jangan bagikan kepada siapa pun.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="destructive">{error}</Alert>}

          <PasswordField
            label="Password lama"
            name="currentPassword"
            value={form.currentPassword}
            visible={visible.currentPassword}
            autoComplete="current-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('currentPassword')}
          />

          <Separator />

          <PasswordField
            label="Password baru"
            name="newPassword"
            value={form.newPassword}
            visible={visible.newPassword}
            autoComplete="new-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('newPassword')}
          />
          <PasswordField
            label="Konfirmasi password baru"
            name="confirmPassword"
            value={form.confirmPassword}
            visible={visible.confirmPassword}
            autoComplete="new-password"
            onChange={handleChange}
            onToggleVisibility={() => toggleVisibility('confirmPassword')}
          />

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              href={backHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
              <X className="h-4 w-4" />
              Batal
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4" />
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PasswordField({
  label,
  name,
  value,
  visible,
  autoComplete,
  onChange,
  onToggleVisibility,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  visible: boolean;
  autoComplete: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onToggleVisibility: () => void;
}) {
  const Icon = visible ? EyeOff : Eye;

  return (
    <Label className="block">
      <span className="mb-2 block">{label}</span>
      <span className="relative block">
        <Input
          name={name}
          value={value}
          type={visible ? 'text' : 'password'}
          onChange={onChange}
          className="pr-12"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-text-muted transition hover:bg-surface hover:text-primary"
          aria-label={visible ? 'Sembunyikan password' : 'Tampilkan password'}>
          <Icon className="h-4 w-4" />
        </button>
      </span>
    </Label>
  );
}
