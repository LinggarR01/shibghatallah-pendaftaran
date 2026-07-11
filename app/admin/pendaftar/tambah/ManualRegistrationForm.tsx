'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Copy, Eye, EyeOff, KeyRound, Save, X } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { DocumentUploadCard } from '@/app/components/ui/DocumentUploadCard';
import { Input } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { Select } from '@/app/components/ui/Select';
import { Separator } from '@/app/components/ui/Separator';
import { Stepper, type StepperItem } from '@/app/components/ui/Stepper';
import { Textarea } from '@/app/components/ui/Textarea';
import { toast } from '@/app/components/ui/Toast';
import { cn } from '@/lib/cn';

type FormState = {
  accountName: string;
  email: string;
  accountPhone: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  nik: string;
  nisn: string;
  gender: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  studentPhone: string;
  childOrder: string;
  siblingCount: string;
  medicalHistory: string;
  fatherName: string;
  fatherNik: string;
  fatherJob: string;
  fatherEducation: string;
  fatherPhone: string;
  fatherIncome: string;
  motherName: string;
  motherNik: string;
  motherJob: string;
  motherEducation: string;
  motherPhone: string;
  motherIncome: string;
  guardianName: string;
  guardianNik: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianAddress: string;
  guardianJob: string;
  guardianEducation: string;
  parentAddress: string;
  schoolName: string;
  npsn: string;
  schoolAddress: string;
  graduationYear: string;
  certificateNumber: string;
  status: string;
  catatanAdmin: string;
};

type ApiPayload = {
  success: boolean;
  message?: string;
  data?: {
    documentCount?: number;
  };
};

type ManualDocumentType =
  | 'foto_santri'
  | 'kartu_keluarga'
  | 'akta_kelahiran'
  | 'ijazah'
  | 'ktp_orang_tua'
  | 'pas_foto'
  | 'lainnya';

type SelectedDocuments = Partial<Record<ManualDocumentType, File | null>>;

type StepId =
  | 'account'
  | 'student'
  | 'parent'
  | 'education'
  | 'statusDocuments'
  | 'confirmation';

const initialForm: FormState = {
  accountName: '',
  email: '',
  accountPhone: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  nik: '',
  nisn: '',
  gender: '',
  birthPlace: '',
  birthDate: '',
  address: '',
  province: '',
  city: '',
  district: '',
  village: '',
  postalCode: '',
  studentPhone: '',
  childOrder: '',
  siblingCount: '',
  medicalHistory: '',
  fatherName: '',
  fatherNik: '',
  fatherJob: '',
  fatherEducation: '',
  fatherPhone: '',
  fatherIncome: '',
  motherName: '',
  motherNik: '',
  motherJob: '',
  motherEducation: '',
  motherPhone: '',
  motherIncome: '',
  guardianName: '',
  guardianNik: '',
  guardianRelation: '',
  guardianPhone: '',
  guardianAddress: '',
  guardianJob: '',
  guardianEducation: '',
  parentAddress: '',
  schoolName: '',
  npsn: '',
  schoolAddress: '',
  graduationYear: '',
  certificateNumber: '',
  status: 'draft',
  catatanAdmin: '',
};

const maxDocumentSize = 5 * 1024 * 1024;
const allowedDocumentMimeTypes = ['application/pdf', 'image/jpeg', 'image/png'];

const manualDocumentDefinitions: Array<{
  type: ManualDocumentType;
  label: string;
  description: string;
}> = [
  {
    type: 'foto_santri',
    label: 'Foto santri',
    description: 'Foto calon santri terbaru.',
  },
  {
    type: 'kartu_keluarga',
    label: 'Kartu Keluarga',
    description: 'Dokumen Kartu Keluarga.',
  },
  {
    type: 'akta_kelahiran',
    label: 'Akta kelahiran',
    description: 'Akta kelahiran calon santri.',
  },
  {
    type: 'ijazah',
    label: 'Ijazah/SKL',
    description: 'Ijazah atau surat keterangan lulus.',
  },
  {
    type: 'ktp_orang_tua',
    label: 'KTP orang tua/wali',
    description: 'Identitas orang tua atau wali.',
  },
  {
    type: 'pas_foto',
    label: 'Pas foto',
    description: 'Pas foto tambahan jika tersedia.',
  },
  {
    type: 'lainnya',
    label: 'Dokumen lainnya',
    description: 'Dokumen pendukung lain.',
  },
];

const formSteps: Array<{ id: StepId; label: string }> = [
  { id: 'account', label: 'Data Akun' },
  { id: 'student', label: 'Data Santri' },
  { id: 'parent', label: 'Orang Tua/Wali' },
  { id: 'education', label: 'Pendidikan' },
  { id: 'statusDocuments', label: 'Status & Dokumen' },
  { id: 'confirmation', label: 'Konfirmasi' },
];

function generatePassword() {
  const chars =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const values = new Uint32Array(12);
  window.crypto.getRandomValues(values);

  return Array.from(values, (value) => chars[value % chars.length]).join('');
}

function buildPayload(form: FormState) {
  return {
    account: {
      nama: form.accountName,
      email: form.email,
      noHp: form.accountPhone,
      password: form.password,
      konfirmasiPassword: form.confirmPassword,
    },
    student: {
      fullName: form.fullName,
      nik: form.nik,
      nisn: form.nisn,
      gender: form.gender,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      address: form.address,
      province: form.province,
      city: form.city,
      district: form.district,
      village: form.village,
      postalCode: form.postalCode,
      phone: form.studentPhone,
      childOrder: form.childOrder,
      siblingCount: form.siblingCount,
      medicalHistory: form.medicalHistory,
    },
    parent: {
      fatherName: form.fatherName,
      fatherNik: form.fatherNik,
      fatherJob: form.fatherJob,
      fatherEducation: form.fatherEducation,
      fatherPhone: form.fatherPhone,
      fatherIncome: form.fatherIncome,
      motherName: form.motherName,
      motherNik: form.motherNik,
      motherJob: form.motherJob,
      motherEducation: form.motherEducation,
      motherPhone: form.motherPhone,
      motherIncome: form.motherIncome,
      guardianName: form.guardianName,
      guardianNik: form.guardianNik,
      guardianRelation: form.guardianRelation,
      guardianPhone: form.guardianPhone,
      guardianAddress: form.guardianAddress,
      guardianJob: form.guardianJob,
      guardianEducation: form.guardianEducation,
      parentAddress: form.parentAddress,
    },
    previousSchool: {
      schoolName: form.schoolName,
      npsn: form.npsn,
      schoolAddress: form.schoolAddress,
      graduationYear: form.graduationYear,
      certificateNumber: form.certificateNumber,
    },
    registration: {
      status: form.status,
      catatanAdmin: form.catatanAdmin,
    },
  };
}

export default function ManualRegistrationForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedDocuments, setSelectedDocuments] = useState<SelectedDocuments>(
    {},
  );
  const [activeStep, setActiveStep] = useState<StepId>('account');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [hasGuardian, setHasGuardian] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const activeStepIndex = formSteps.findIndex((step) => step.id === activeStep);
  const selectedDocumentCount =
    Object.values(selectedDocuments).filter(Boolean).length;

  function showError(message: string) {
    setError(message);
    toast.error(message);
  }

  function handleChange(
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (name === 'password' || name === 'confirmPassword') {
      setGeneratedPassword('');
    }
  }

  function handleGeneratePassword() {
    const password = generatePassword();
    setGeneratedPassword(password);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setForm((current) => ({
      ...current,
      password,
      confirmPassword: password,
    }));
  }

  async function handleCopyPassword() {
    if (!form.password) {
      showError('Generate atau isi password terlebih dahulu.');
      return;
    }

    try {
      await navigator.clipboard.writeText(form.password);
      toast.success('Password berhasil disalin.');
    } catch {
      showError('Gagal menyalin password.');
    }
  }

  function handleDocumentChange(
    documentType: ManualDocumentType,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0] ?? null;

    if (file && !allowedDocumentMimeTypes.includes(file.type)) {
      showError('File harus PDF, JPG, JPEG, atau PNG.');
      event.target.value = '';
      return;
    }

    if (file && file.size > maxDocumentSize) {
      showError('Ukuran file maksimal 5 MB.');
      event.target.value = '';
      return;
    }

    setSelectedDocuments((current) => ({
      ...current,
      [documentType]: file,
    }));
  }

  function hasSelectedDocuments() {
    return Object.values(selectedDocuments).some(Boolean);
  }

  function removeSelectedDocument(documentType: ManualDocumentType) {
    setSelectedDocuments((current) => ({
      ...current,
      [documentType]: null,
    }));
  }

  function getStepValidationMessage(stepId: StepId) {
    if (stepId === 'account') {
      if (
        !form.accountName.trim() ||
        !form.email.trim() ||
        !form.password ||
        !form.confirmPassword
      ) {
        return 'Mohon lengkapi data akun yang wajib diisi.';
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return 'Format email tidak valid.';
      }

      if (form.password.length < 8) {
        return 'Password minimal 8 karakter.';
      }

      if (form.password !== form.confirmPassword) {
        return 'Konfirmasi password tidak sama.';
      }
    }

    if (stepId === 'student') {
      if (
        !form.fullName.trim() ||
        !form.nik.trim() ||
        !form.gender ||
        !form.birthPlace.trim() ||
        !form.birthDate ||
        !form.address.trim()
      ) {
        return 'Mohon lengkapi data calon santri yang wajib diisi.';
      }

      if (!/^\d{16}$/.test(form.nik.trim())) {
        return 'NIK harus terdiri dari 16 digit angka.';
      }

      if (form.nisn.trim() && !/^\d{10}$/.test(form.nisn.trim())) {
        return 'NISN harus terdiri dari 10 digit angka.';
      }

      if (new Date(form.birthDate) > new Date()) {
        return 'Tanggal lahir tidak boleh di masa depan.';
      }

      if (form.childOrder && Number(form.childOrder) < 1) {
        return 'Anak ke- minimal 1.';
      }

      if (form.siblingCount && Number(form.siblingCount) < 0) {
        return 'Jumlah saudara minimal 0.';
      }
    }

    if (stepId === 'parent') {
      if (!form.fatherName.trim() || !form.motherName.trim()) {
        return 'Nama ayah dan nama ibu wajib diisi.';
      }

      if (
        !form.fatherPhone.trim() &&
        !form.motherPhone.trim() &&
        !form.guardianPhone.trim()
      ) {
        return 'Nomor HP ayah, ibu, atau wali wajib diisi salah satu.';
      }
    }

    if (stepId === 'education' && !form.schoolName.trim()) {
      return 'Asal sekolah wajib diisi.';
    }

    if (stepId === 'statusDocuments') {
      if (form.status === 'perlu_revisi' && !form.catatanAdmin.trim()) {
        return 'Catatan admin wajib diisi untuk status Perlu Revisi.';
      }

      for (const file of Object.values(selectedDocuments)) {
        if (!file) continue;

        if (!allowedDocumentMimeTypes.includes(file.type)) {
          return 'File harus PDF, JPG, JPEG, atau PNG.';
        }

        if (file.size > maxDocumentSize) {
          return 'Ukuran file maksimal 5 MB.';
        }
      }
    }

    return null;
  }

  function validateForm() {
    for (const step of formSteps) {
      if (step.id === 'confirmation') continue;

      const message = getStepValidationMessage(step.id);
      if (message) {
        setActiveStep(step.id);
        return message;
      }
    }

    return null;
  }

  function goToNextStep() {
    const validationMessage = getStepValidationMessage(activeStep);

    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setError('');
    setActiveStep(
      formSteps[Math.min(activeStepIndex + 1, formSteps.length - 1)].id,
    );
  }

  function goToPreviousStep() {
    setError('');
    setActiveStep(formSteps[Math.max(activeStepIndex - 1, 0)].id);
  }

  function getStepperItems(): StepperItem[] {
    return formSteps.map((step, index) => {
      const hasStepError = Boolean(error && step.id === activeStep);

      return {
        id: step.id,
        label: step.label,
        state: hasStepError
          ? 'error'
          : index < activeStepIndex
            ? 'complete'
            : index === activeStepIndex
              ? 'active'
              : 'pending',
      };
    });
  }

  async function submitRegistration() {
    setError('');

    const validationMessage = validateForm();
    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setLoading(true);

    try {
      const requestBody = new FormData();
      requestBody.append('payload', JSON.stringify(buildPayload(form)));

      for (const [documentType, file] of Object.entries(selectedDocuments)) {
        if (file) {
          requestBody.append(`document:${documentType}`, file);
        }
      }

      const response = await fetch('/api/admin/pendaftar/manual', {
        method: 'POST',
        credentials: 'include',
        body: requestBody,
      });
      const payload = (await response.json()) as ApiPayload;

      if (!response.ok) {
        showError(payload.message || 'Gagal membuat pendaftar manual.');
        return;
      }

      const documentCount = payload.data?.documentCount ?? 0;
      const successMessage =
        documentCount > 0
          ? 'Pendaftar, akun, dan dokumen berhasil dibuat.'
          : 'Pendaftar dan akun berhasil dibuat.';

      toast.success(successMessage);
      router.push(
        `/admin/pendaftar?created=${documentCount > 0 ? 'documents' : '1'}`,
      );
      router.refresh();
    } catch {
      showError('Gagal membuat pendaftar manual.');
    } finally {
      setLoading(false);
      setConfirmSubmit(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeStep !== 'confirmation') {
      goToNextStep();
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      showError(validationMessage);
      return;
    }

    setConfirmSubmit(true);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Stepper items={getStepperItems()} />

      {error && <Alert variant="destructive">{error}</Alert>}

      {activeStep === 'account' && (
        <FormCard
          title="Data Akun"
          description="Akun ini akan digunakan untuk masuk dan mengakses data pendaftaran calon santri. Role otomatis PENDAFTAR.">
          <Field
            label="Nama akun *"
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            autoComplete="name"
          />
          <Field
            label="Email untuk login *"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
          />
          <Field
            label="Nomor HP pemilik akun"
            name="accountPhone"
            type="tel"
            inputMode="tel"
            value={form.accountPhone}
            onChange={handleChange}
            autoComplete="tel"
          />
          <div className="md:col-span-2">
            <Separator />
          </div>
          {generatedPassword && (
            <Alert className="md:col-span-2">
              Password otomatis:{' '}
              <span className="font-semibold">{generatedPassword}</span>
            </Alert>
          )}
          <Field
            label="Password awal *"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <Field
            label="Konfirmasi password *"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
          />
          <div className="grid gap-2 sm:grid-cols-2 md:col-span-2 lg:grid-cols-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePassword}>
              <KeyRound className="h-4 w-4" />
              Generate Password
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyPassword}>
              <Copy className="h-4 w-4" />
              Salin Password
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPassword ? 'Sembunyikan' : 'Tampilkan'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowConfirmPassword((value) => !value)}>
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              Konfirmasi
            </Button>
          </div>
          <p className="text-sm leading-6 text-text-muted md:col-span-2">
            Password minimal 8 karakter. Password akan di-hash di server dan
            tidak dicatat di log.
          </p>
        </FormCard>
      )}

      {activeStep === 'student' && (
        <FormCard title="Data Calon Santri">
          <div className="md:col-span-2">
            <h2 className="font-bold text-text-main">Identitas Santri</h2>
          </div>
          <Field
            label="Nama lengkap calon santri *"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
          />
          <Field
            label="NIK *"
            name="nik"
            value={form.nik}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={16}
          />
          <Field
            label="NISN"
            name="nisn"
            value={form.nisn}
            onChange={handleChange}
            inputMode="numeric"
            maxLength={10}
          />
          <SelectField
            label="Jenis kelamin *"
            name="gender"
            value={form.gender}
            onChange={handleChange}>
            <option value="">Pilih jenis kelamin</option>
            <option value="laki_laki">Laki-laki</option>
            <option value="perempuan">Perempuan</option>
          </SelectField>
          <Field
            label="Tempat lahir *"
            name="birthPlace"
            value={form.birthPlace}
            onChange={handleChange}
          />
          <Field
            label="Tanggal lahir *"
            name="birthDate"
            type="date"
            value={form.birthDate}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Separator />
            <h2 className="mt-4 font-bold text-text-main">
              Kontak dan Keluarga
            </h2>
          </div>
          <Field
            label="Nomor HP santri"
            name="studentPhone"
            type="tel"
            inputMode="tel"
            value={form.studentPhone}
            onChange={handleChange}
          />
          <Field
            label="Anak ke-"
            name="childOrder"
            type="number"
            min={1}
            value={form.childOrder}
            onChange={handleChange}
          />
          <Field
            label="Jumlah saudara"
            name="siblingCount"
            type="number"
            min={0}
            value={form.siblingCount}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Separator />
            <h2 className="mt-4 font-bold text-text-main">Alamat</h2>
          </div>
          <TextAreaField
            label="Alamat lengkap *"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Field
            label="Provinsi"
            name="province"
            value={form.province}
            onChange={handleChange}
          />
          <Field
            label="Kabupaten/Kota"
            name="city"
            value={form.city}
            onChange={handleChange}
          />
          <Field
            label="Kecamatan"
            name="district"
            value={form.district}
            onChange={handleChange}
          />
          <Field
            label="Kelurahan/Desa"
            name="village"
            value={form.village}
            onChange={handleChange}
          />
          <Field
            label="Kode pos"
            name="postalCode"
            inputMode="numeric"
            maxLength={5}
            value={form.postalCode}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Separator />
            <h2 className="mt-4 font-bold text-text-main">Kesehatan</h2>
          </div>
          <SelectField
            label="Apakah calon santri memiliki riwayat penyakit?"
            name="medicalHistory"
            value={hasMedicalHistory ? 'ya' : 'tidak'}
            onChange={(event) => {
              const hasHistory = event.target.value === 'ya';
              setHasMedicalHistory(hasHistory);
              if (!hasHistory) {
                setForm((current) => ({ ...current, medicalHistory: '' }));
              }
            }}>
            <option value="tidak">Tidak</option>
            <option value="ya">Ya</option>
          </SelectField>
          {hasMedicalHistory && (
            <TextAreaField
              label="Riwayat penyakit"
              name="medicalHistory"
              value={form.medicalHistory}
              onChange={handleChange}
              className="md:col-span-2"
            />
          )}
        </FormCard>
      )}

      {activeStep === 'parent' && (
        <FormCard title="Data Orang Tua/Wali">
          <div className="md:col-span-2">
            <h2 className="font-bold text-text-main">Data Ayah</h2>
          </div>
          <Field
            label="Nama ayah *"
            name="fatherName"
            value={form.fatherName}
            onChange={handleChange}
          />
          <Field
            label="NIK ayah"
            name="fatherNik"
            value={form.fatherNik}
            onChange={handleChange}
            maxLength={16}
          />
          <Field
            label="Pekerjaan ayah"
            name="fatherJob"
            value={form.fatherJob}
            onChange={handleChange}
          />
          <Field
            label="Pendidikan ayah"
            name="fatherEducation"
            value={form.fatherEducation}
            onChange={handleChange}
          />
          <Field
            label="Nomor HP ayah"
            name="fatherPhone"
            value={form.fatherPhone}
            onChange={handleChange}
          />
          <Field
            label="Penghasilan ayah"
            name="fatherIncome"
            inputMode="numeric"
            value={form.fatherIncome}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Separator />
            <h2 className="mt-4 font-bold text-text-main">Data Ibu</h2>
          </div>
          <Field
            label="Nama ibu *"
            name="motherName"
            value={form.motherName}
            onChange={handleChange}
          />
          <Field
            label="NIK ibu"
            name="motherNik"
            value={form.motherNik}
            onChange={handleChange}
            maxLength={16}
          />
          <Field
            label="Pekerjaan ibu"
            name="motherJob"
            value={form.motherJob}
            onChange={handleChange}
          />
          <Field
            label="Pendidikan ibu"
            name="motherEducation"
            value={form.motherEducation}
            onChange={handleChange}
          />
          <Field
            label="Nomor HP ibu"
            name="motherPhone"
            value={form.motherPhone}
            onChange={handleChange}
          />
          <Field
            label="Penghasilan ibu"
            name="motherIncome"
            inputMode="numeric"
            value={form.motherIncome}
            onChange={handleChange}
          />
          <div className="md:col-span-2">
            <Separator />
          </div>
          <SelectField
            label="Apakah calon santri memiliki wali selain ayah atau ibu?"
            name="guardianName"
            value={hasGuardian ? 'ya' : 'tidak'}
            onChange={(event) => {
              const usesGuardian = event.target.value === 'ya';
              setHasGuardian(usesGuardian);
              if (!usesGuardian) {
                setForm((current) => ({
                  ...current,
                  guardianName: '',
                  guardianNik: '',
                  guardianRelation: '',
                  guardianPhone: '',
                  guardianAddress: '',
                  guardianJob: '',
                  guardianEducation: '',
                }));
              }
            }}>
            <option value="tidak">Tidak</option>
            <option value="ya">Ya</option>
          </SelectField>
          {hasGuardian && (
            <>
              <div className="md:col-span-2">
                <h2 className="font-bold text-text-main">Data Wali</h2>
              </div>
              <Field
                label="Nama wali"
                name="guardianName"
                value={form.guardianName}
                onChange={handleChange}
              />
              <Field
                label="NIK wali"
                name="guardianNik"
                value={form.guardianNik}
                onChange={handleChange}
                maxLength={16}
              />
              <Field
                label="Hubungan wali"
                name="guardianRelation"
                value={form.guardianRelation}
                onChange={handleChange}
              />
              <Field
                label="Nomor HP wali"
                name="guardianPhone"
                value={form.guardianPhone}
                onChange={handleChange}
              />
              <Field
                label="Pekerjaan wali"
                name="guardianJob"
                value={form.guardianJob}
                onChange={handleChange}
              />
              <Field
                label="Pendidikan wali"
                name="guardianEducation"
                value={form.guardianEducation}
                onChange={handleChange}
              />
              <TextAreaField
                label="Alamat orang tua"
                name="parentAddress"
                value={form.parentAddress}
                onChange={handleChange}
                className="md:col-span-2"
              />
              <TextAreaField
                label="Alamat wali"
                name="guardianAddress"
                value={form.guardianAddress}
                onChange={handleChange}
                className="md:col-span-2"
              />
            </>
          )}
        </FormCard>
      )}

      {activeStep === 'education' && (
        <FormCard title="Data Pendidikan Sebelumnya">
          <Field
            label="Asal sekolah *"
            name="schoolName"
            value={form.schoolName}
            onChange={handleChange}
          />
          <Field
            label="NPSN"
            name="npsn"
            value={form.npsn}
            onChange={handleChange}
          />
          <TextAreaField
            label="Alamat sekolah"
            name="schoolAddress"
            value={form.schoolAddress}
            onChange={handleChange}
            className="md:col-span-2"
          />
          <Field
            label="Tahun lulus"
            name="graduationYear"
            value={form.graduationYear}
            onChange={handleChange}
          />
          <Field
            label="Nomor ijazah"
            name="certificateNumber"
            value={form.certificateNumber}
            onChange={handleChange}
          />
        </FormCard>
      )}

      {activeStep === 'statusDocuments' && (
        <>
          <FormCard title="Status dan Catatan Admin">
            <SelectField
              label="Status awal"
              name="status"
              value={form.status}
              onChange={handleChange}>
              <option value="draft">Draft</option>
              <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
              <option value="diterima">Diterima</option>
              <option value="ditolak">Ditolak</option>
              <option value="perlu_revisi">Perlu Revisi</option>
            </SelectField>
            {form.status === 'perlu_revisi' && (
              <Alert variant="warning" className="md:col-span-2">
                Catatan admin wajib diisi karena status yang dipilih adalah
                Perlu Revisi.
              </Alert>
            )}
            <TextAreaField
              label="Catatan admin"
              name="catatanAdmin"
              value={form.catatanAdmin}
              onChange={handleChange}
              className="md:col-span-2"
              placeholder="Wajib diisi jika status PERLU REVISI"
            />
          </FormCard>

          <FormCard
            title="Dokumen Pendaftar"
            description="Opsional. Format PDF, JPG, JPEG, atau PNG. Maksimal 5 MB per file.">
            {manualDocumentDefinitions.map((definition) => {
              const selectedFile = selectedDocuments[definition.type];

              return (
                <div key={definition.type} className="md:col-span-2">
                  <DocumentUploadCard
                    title={definition.label}
                    description={definition.description}
                    selectedFile={selectedFile}
                    busy={loading}
                    onFileChange={(event) =>
                      handleDocumentChange(definition.type, event)
                    }
                    onRemove={() => removeSelectedDocument(definition.type)}
                  />
                </div>
              );
            })}
            {hasSelectedDocuments() && (
              <Alert variant="success" className="md:col-span-2">
                {Object.values(selectedDocuments).filter(Boolean).length}{' '}
                dokumen siap diunggah.
              </Alert>
            )}
          </FormCard>
        </>
      )}

      {activeStep === 'confirmation' && (
        <FormCard
          title="Konfirmasi Data"
          description="Periksa kembali ringkasan sebelum membuat akun dan pendaftar.">
          <SummaryItem
            label="Akun"
            value={`${form.accountName} - ${form.email}`}
            onEdit={() => setActiveStep('account')}
          />
          <SummaryItem
            label="Santri"
            value={`${form.fullName || '-'} - NIK ${form.nik || '-'}`}
            onEdit={() => setActiveStep('student')}
          />
          <SummaryItem
            label="Orang tua"
            value={`Ayah: ${form.fatherName || '-'}, Ibu: ${form.motherName || '-'}`}
            onEdit={() => setActiveStep('parent')}
          />
          <SummaryItem
            label="Pendidikan"
            value={form.schoolName || '-'}
            onEdit={() => setActiveStep('education')}
          />
          <SummaryItem
            label="Status"
            value={form.status.replaceAll('_', ' ')}
            onEdit={() => setActiveStep('statusDocuments')}
          />
          <SummaryItem
            label="Dokumen"
            value={`${selectedDocumentCount} dokumen dipilih`}
            onEdit={() => setActiveStep('statusDocuments')}
          />
        </FormCard>
      )}

      <Card className="sticky bottom-4 z-20">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Link
            href="/admin/pendaftar"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
            <X className="h-4 w-4" />
            Batal
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {activeStepIndex > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={loading}>
                Sebelumnya
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4" />
              {activeStep === 'confirmation'
                ? loading
                  ? 'Menyimpan...'
                  : 'Buat Akun dan Pendaftar'
                : 'Selanjutnya'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmSubmit}
        title="Apakah data sudah benar?"
        description="Sistem akan membuat akun dengan dokumen yang dipilihkan oleh Admin."
        confirmLabel="Buat Akun dan Pendaftar"
        loading={loading}
        onOpenChange={setConfirmSubmit}
        onConfirm={() => void submitRegistration()}
      />
    </form>
  );
}

function FormCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
            {label}
          </p>
          <p className="mt-2 break-words text-sm leading-6 text-text-main">
            {value || '-'}
          </p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}

type FieldProps = React.ComponentProps<typeof Input> & {
  label: string;
  name: keyof FormState;
  className?: string;
};

function Field({ label, name, className, ...props }: FieldProps) {
  return (
    <Label className={cn('block', className)}>
      <span className="mb-2 block">{label}</span>
      <Input name={name} {...props} />
    </Label>
  );
}

type TextAreaFieldProps = React.ComponentProps<typeof Textarea> & {
  label: string;
  name: keyof FormState;
  className?: string;
};

function TextAreaField({
  label,
  name,
  className,
  ...props
}: TextAreaFieldProps) {
  return (
    <Label className={cn('block', className)}>
      <span className="mb-2 block">{label}</span>
      <Textarea name={name} {...props} />
    </Label>
  );
}

type SelectFieldProps = React.ComponentProps<typeof Select> & {
  label: string;
  name: keyof FormState;
  className?: string;
};

function SelectField({
  label,
  name,
  className,
  children,
  ...props
}: SelectFieldProps) {
  return (
    <Label className={cn('block', className)}>
      <span className="mb-2 block">{label}</span>
      <Select name={name} {...props}>
        {children}
      </Select>
    </Label>
  );
}
