'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type InputHTMLAttributes } from 'react';
import { Save, Send } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { ConfirmDialog } from '@/app/components/ui/ConfirmDialog';
import { FormSection } from '@/app/components/ui/FormSection';
import { Input as UiInput } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select as UiSelect } from '@/app/components/ui/Select';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Stepper, type StepperItem } from '@/app/components/ui/Stepper';
import { Textarea as UiTextarea } from '@/app/components/ui/Textarea';
import { toast } from '@/app/components/ui/Toast';
import { cn } from '@/lib/cn';

type FormState = {
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
  phone: string;
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
  guardianRelation: string;
  guardianPhone: string;
  guardianAddress: string;
  guardianJob: string;
  schoolName: string;
  npsn: string;
  schoolAddress: string;
  graduationYear: string;
  certificateNumber: string;
};

const initialFormState: FormState = {
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
  phone: '',
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
  guardianRelation: '',
  guardianPhone: '',
  guardianAddress: '',
  guardianJob: '',
  schoolName: '',
  npsn: '',
  schoolAddress: '',
  graduationYear: '',
  certificateNumber: '',
};

const lockedStatuses = ['menunggu_verifikasi', 'dikirim', 'sedang_diperiksa', 'diterima', 'ditolak'];

type StepId = 'student' | 'parent' | 'education' | 'documents' | 'confirmation';

const formSteps: Array<{ id: StepId; label: string }> = [
  { id: 'student', label: 'Data Diri' },
  { id: 'parent', label: 'Orang Tua/Wali' },
  { id: 'education', label: 'Pendidikan' },
  { id: 'documents', label: 'Dokumen' },
  { id: 'confirmation', label: 'Konfirmasi' },
];

function toDateInput(value?: string | null) {
  if (!value) return '';
  return value.slice(0, 10);
}

function buildPayload(form: FormState) {
  return {
    student: {
      fullName: form.fullName,
      nik: form.nik,
      nisn: form.nisn,
      gender: form.gender || null,
      birthPlace: form.birthPlace,
      birthDate: form.birthDate,
      address: form.address,
      province: form.province,
      city: form.city,
      district: form.district,
      village: form.village,
      postalCode: form.postalCode,
      phone: form.phone,
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
      guardianRelation: form.guardianRelation,
      guardianPhone: form.guardianPhone,
      guardianAddress: form.guardianAddress,
      guardianJob: form.guardianJob,
    },
    previousSchool: {
      schoolName: form.schoolName,
      npsn: form.npsn,
      schoolAddress: form.schoolAddress,
      graduationYear: form.graduationYear,
      certificateNumber: form.certificateNumber,
    },
  };
}

export default function RegistrationFormClient() {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>('student');
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const activeStepIndex = formSteps.findIndex((step) => step.id === activeStep);

  const readonly = useMemo(() => {
    return status ? lockedStatuses.includes(status) : false;
  }, [status]);

  useEffect(() => {
    async function loadRegistration() {
      try {
        const response = await fetch('/api/pendaftaran/current', {
          credentials: 'include',
        });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload.message || 'Gagal mengambil data pendaftaran');
          return;
        }

        const data = payload.data;
        if (!data) return;

        setStatus(data.status);
        setForm({
          fullName: data.profilSantri?.namaLengkap ?? '',
          nik: data.profilSantri?.nik ?? '',
          nisn: data.profilSantri?.nisn ?? '',
          gender: data.profilSantri?.jenisKelamin ?? '',
          birthPlace: data.profilSantri?.tempatLahir ?? '',
          birthDate: toDateInput(data.profilSantri?.tanggalLahir),
          address: data.profilSantri?.alamat ?? '',
          province: data.profilSantri?.provinsi ?? '',
          city: data.profilSantri?.kota ?? '',
          district: data.profilSantri?.kecamatan ?? '',
          village: data.profilSantri?.desa ?? '',
          postalCode: data.profilSantri?.kodePos ?? '',
          phone: data.profilSantri?.noHp ?? '',
          childOrder: data.profilSantri?.anakKe?.toString() ?? '',
          siblingCount: data.profilSantri?.jumlahSaudara?.toString() ?? '',
          medicalHistory: data.profilSantri?.riwayatPenyakit ?? '',
          fatherName: data.profilOrangTua?.namaAyah ?? '',
          fatherNik: data.profilOrangTua?.nikAyah ?? '',
          fatherJob: data.profilOrangTua?.pekerjaanAyah ?? '',
          fatherEducation: data.profilOrangTua?.pendidikanAyah ?? '',
          fatherPhone: data.profilOrangTua?.noHpAyah ?? '',
          fatherIncome: data.profilOrangTua?.penghasilanAyah ?? '',
          motherName: data.profilOrangTua?.namaIbu ?? '',
          motherNik: data.profilOrangTua?.nikIbu ?? '',
          motherJob: data.profilOrangTua?.pekerjaanIbu ?? '',
          motherEducation: data.profilOrangTua?.pendidikanIbu ?? '',
          motherPhone: data.profilOrangTua?.noHpIbu ?? '',
          motherIncome: data.profilOrangTua?.penghasilanIbu ?? '',
          guardianName: data.profilOrangTua?.namaWali ?? '',
          guardianRelation: data.profilOrangTua?.hubunganWali ?? '',
          guardianPhone: data.profilOrangTua?.noHpWali ?? '',
          guardianAddress: data.profilOrangTua?.alamatWali ?? '',
          guardianJob: data.profilOrangTua?.pekerjaanWali ?? '',
          schoolName: data.sekolahSebelumnya?.namaSekolah ?? data.profilSantri?.sekolahAsal ?? '',
          npsn: data.sekolahSebelumnya?.npsn ?? '',
          schoolAddress: data.sekolahSebelumnya?.alamatSekolah ?? '',
          graduationYear: data.sekolahSebelumnya?.tahunLulus ?? '',
          certificateNumber: data.sekolahSebelumnya?.nomorIjazah ?? '',
        });
      } finally {
        setLoading(false);
      }
    }

    void loadRegistration();
  }, []);

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function getStepValidationMessage(stepId: StepId) {
    if (stepId === 'student') {
      if (
        !form.fullName.trim() ||
        !form.nik.trim() ||
        !form.gender ||
        !form.birthPlace.trim() ||
        !form.birthDate ||
        !form.address.trim()
      ) {
        return 'Mohon lengkapi data diri yang wajib diisi.';
      }

      if (!/^\d{16}$/.test(form.nik.trim())) {
        return 'NIK harus terdiri dari 16 digit angka.';
      }

      if (form.nisn.trim() && !/^\d{10}$/.test(form.nisn.trim())) {
        return 'NISN harus terdiri dari 10 digit angka.';
      }
    }

    if (stepId === 'parent') {
      if (!form.fatherName.trim() || !form.motherName.trim()) {
        return 'Nama ayah dan nama ibu wajib diisi.';
      }

      if (!form.fatherPhone.trim() && !form.motherPhone.trim() && !form.guardianPhone.trim()) {
        return 'Nomor HP ayah, ibu, atau wali wajib diisi salah satu.';
      }
    }

    if (stepId === 'education' && !form.schoolName.trim()) {
      return 'Asal sekolah wajib diisi.';
    }

    return null;
  }

  function getStepperItems(): StepperItem[] {
    return formSteps.map((step, index) => ({
      id: step.id,
      label: step.label,
      state:
        error && step.id === activeStep
          ? 'error'
          : index < activeStepIndex
            ? 'complete'
            : index === activeStepIndex
              ? 'active'
              : 'pending',
    }));
  }

  function goToNextStep() {
    const validationMessage = getStepValidationMessage(activeStep);

    if (validationMessage) {
      setError(validationMessage);
      toast.warning(validationMessage);
      return;
    }

    setError('');
    setActiveStep(formSteps[Math.min(activeStepIndex + 1, formSteps.length - 1)].id);
  }

  function goToPreviousStep() {
    setError('');
    setActiveStep(formSteps[Math.max(activeStepIndex - 1, 0)].id);
  }

  async function submitRequest(endpoint: string, successMessage: string) {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(endpoint, {
        method: endpoint.endsWith('/submit') ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(buildPayload(form)),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = payload.message || 'Gagal menyimpan data pendaftaran.';
        setError(message);
        toast.error(message);
        return;
      }

      setStatus(payload.data?.status ?? status);
      setMessage(successMessage);
      toast.success(successMessage);
    } catch {
      const message = 'Terjadi kesalahan. Silakan coba lagi.';
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function handleSaveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!readonly) {
      void submitRequest(
        '/api/pendaftaran/current',
        'Data pendaftaran berhasil disimpan.',
      );
    }
  }

  function validateAllSteps() {
    for (const step of formSteps) {
      if (step.id === 'documents' || step.id === 'confirmation') continue;
      const validationMessage = getStepValidationMessage(step.id);
      if (validationMessage) {
        setActiveStep(step.id);
        return validationMessage;
      }
    }

    return null;
  }

  function handleSubmitRegistration() {
    if (!readonly) {
      const message = validateAllSteps();
      if (message) {
        setError(message);
        setMessage('');
        toast.warning(message);
        return;
      }

      setConfirmSubmit(true);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="mt-4 h-8 w-72 max-w-full" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSaveDraft} className="space-y-6">
      <PageHeader
        eyebrow="Formulir Pendaftaran"
        title="Data Santri dan Wali"
        description="Simpan draft kapan saja. Submit hanya akan berhasil jika field wajib sudah lengkap."
      />

      {readonly && (
        <Alert variant="warning">
          Data tidak bisa diedit karena status pendaftaran sudah terkunci.
        </Alert>
      )}
      {message && <Alert variant="success">{message}</Alert>}
      {error && <Alert variant="destructive">{error}</Alert>}

      <Stepper items={getStepperItems()} />

      {activeStep === 'student' && (
      <>
      <FormSection title="Data Calon Santri">
        <Input label="Nama lengkap *" name="fullName" value={form.fullName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK *" name="nik" value={form.nik} onChange={handleChange} disabled={readonly} maxLength={16} inputMode="numeric" />
        <Input label="NISN" name="nisn" value={form.nisn} onChange={handleChange} disabled={readonly} maxLength={10} inputMode="numeric" />
        <Select label="Jenis kelamin *" name="gender" value={form.gender} onChange={handleChange} disabled={readonly} options={[['', 'Pilih'], ['laki_laki', 'Laki-laki'], ['perempuan', 'Perempuan']]} />
        <Input label="Tempat lahir *" name="birthPlace" value={form.birthPlace} onChange={handleChange} disabled={readonly} />
        <Input label="Tanggal lahir *" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP santri" name="phone" type="tel" inputMode="tel" value={form.phone} onChange={handleChange} disabled={readonly} />
        <Input label="Anak ke-" name="childOrder" type="number" min={1} value={form.childOrder} onChange={handleChange} disabled={readonly} />
        <Input label="Jumlah saudara" name="siblingCount" type="number" min={0} value={form.siblingCount} onChange={handleChange} disabled={readonly} />
        <Textarea label="Riwayat penyakit" name="medicalHistory" value={form.medicalHistory} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
      </FormSection>

      <FormSection
        title="Alamat Domisili"
        description="Isi alamat tempat tinggal calon santri secara lengkap.">
        <Textarea label="Alamat lengkap *" name="address" value={form.address} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
        <Input label="Provinsi" name="province" value={form.province} onChange={handleChange} disabled={readonly} />
        <Input label="Kabupaten/Kota" name="city" value={form.city} onChange={handleChange} disabled={readonly} />
        <Input label="Kecamatan" name="district" value={form.district} onChange={handleChange} disabled={readonly} />
        <Input label="Kelurahan/Desa" name="village" value={form.village} onChange={handleChange} disabled={readonly} />
        <Input label="Kode pos" name="postalCode" value={form.postalCode} onChange={handleChange} disabled={readonly} maxLength={5} inputMode="numeric" />
      </FormSection>
      </>
      )}

      {activeStep === 'parent' && (
      <FormSection title="Data Orang Tua/Wali">
        <Input label="Nama ayah *" name="fatherName" value={form.fatherName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK ayah" name="fatherNik" value={form.fatherNik} onChange={handleChange} disabled={readonly} maxLength={16} />
        <Input label="Pekerjaan ayah" name="fatherJob" value={form.fatherJob} onChange={handleChange} disabled={readonly} />
        <Input label="Pendidikan ayah" name="fatherEducation" value={form.fatherEducation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP ayah" name="fatherPhone" type="tel" inputMode="tel" value={form.fatherPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Penghasilan ayah" name="fatherIncome" value={form.fatherIncome} onChange={handleChange} disabled={readonly} />
        <Input label="Nama ibu *" name="motherName" value={form.motherName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK ibu" name="motherNik" value={form.motherNik} onChange={handleChange} disabled={readonly} maxLength={16} />
        <Input label="Pekerjaan ibu" name="motherJob" value={form.motherJob} onChange={handleChange} disabled={readonly} />
        <Input label="Pendidikan ibu" name="motherEducation" value={form.motherEducation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP ibu" name="motherPhone" type="tel" inputMode="tel" value={form.motherPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Penghasilan ibu" name="motherIncome" value={form.motherIncome} onChange={handleChange} disabled={readonly} />
        <Input label="Nama wali" name="guardianName" value={form.guardianName} onChange={handleChange} disabled={readonly} />
        <Input label="Hubungan wali" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP wali" name="guardianPhone" type="tel" inputMode="tel" value={form.guardianPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Pekerjaan wali" name="guardianJob" value={form.guardianJob} onChange={handleChange} disabled={readonly} />
        <Textarea label="Alamat wali" name="guardianAddress" value={form.guardianAddress} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
      </FormSection>
      )}

      {activeStep === 'education' && (
      <FormSection title="Pendidikan Sebelumnya">
        <Input label="Asal sekolah *" name="schoolName" value={form.schoolName} onChange={handleChange} disabled={readonly} />
        <Input label="NPSN" name="npsn" value={form.npsn} onChange={handleChange} disabled={readonly} />
        <Textarea label="Alamat sekolah" name="schoolAddress" value={form.schoolAddress} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
        <Input label="Tahun lulus" name="graduationYear" value={form.graduationYear} onChange={handleChange} disabled={readonly} maxLength={4} inputMode="numeric" />
        <Input label="Nomor ijazah" name="certificateNumber" value={form.certificateNumber} onChange={handleChange} disabled={readonly} />
      </FormSection>
      )}

      {activeStep === 'documents' && (
        <Card>
          <CardContent>
            <h2 className="font-bold text-text-main">Dokumen Pendaftaran</h2>
            <p className="mt-2 text-sm leading-6 text-text-muted">
              Dokumen dikelola pada halaman khusus agar upload, ganti, dan hapus file tetap aman melalui endpoint dokumen.
            </p>
            <a
              href="/pendaftar/dokumen"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary hover:bg-surface">
              Buka Upload Dokumen
            </a>
          </CardContent>
        </Card>
      )}

      {activeStep === 'confirmation' && (
        <FormSection
          title="Konfirmasi"
          description="Periksa ringkasan data sebelum mengirim pendaftaran untuk diverifikasi.">
          <SummaryItem label="Calon santri" value={`${form.fullName || '-'} - NIK ${form.nik || '-'}`} />
          <SummaryItem label="Orang tua" value={`Ayah: ${form.fatherName || '-'}, Ibu: ${form.motherName || '-'}`} />
          <SummaryItem label="Pendidikan" value={form.schoolName || '-'} />
          <SummaryItem label="Alamat" value={form.address || '-'} />
        </FormSection>
      )}

      <Card className="sticky bottom-4 z-20">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div>
            {activeStepIndex > 0 && (
              <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={saving}>
                Sebelumnya
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={readonly || saving} variant="outline">
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
          {activeStep === 'confirmation' ? (
            <Button
              type="button"
              onClick={handleSubmitRegistration}
              disabled={readonly || saving}>
              <Send className="h-4 w-4" />
              Kirim Pendaftaran
            </Button>
          ) : (
            <Button type="button" onClick={goToNextStep} disabled={readonly || saving}>
              Selanjutnya
            </Button>
          )}
          </div>
        </CardContent>
      </Card>
      <ConfirmDialog
        open={confirmSubmit}
        title="Kirim pendaftaran untuk diverifikasi?"
        description="Setelah dikirim, data dan dokumen tidak dapat diubah sampai admin meminta revisi."
        confirmLabel="Kirim Pendaftaran"
        loading={saving}
        onOpenChange={setConfirmSubmit}
        onConfirm={() => {
          setConfirmSubmit(false);
          void submitRequest(
            '/api/pendaftaran/current/submit',
            'Pendaftaran berhasil dikirim untuk diverifikasi.',
          );
        }}
      />
    </form>
  );
}

type FieldProps = {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  disabled: boolean;
  className?: string;
};

function Input({
  label,
  name,
  value,
  onChange,
  disabled,
  className,
  type = 'text',
  maxLength,
  inputMode,
  min,
  autoComplete,
}: FieldProps & {
  type?: string;
  maxLength?: number;
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  min?: number;
  autoComplete?: string;
}) {
  return (
    <Label className={cn('block', className)}>
      <span className="mb-2 block">
        {label}
      </span>
      <UiInput
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        type={type}
        maxLength={maxLength}
        inputMode={inputMode}
        min={min}
        autoComplete={autoComplete}
      />
    </Label>
  );
}

function Textarea({
  label,
  name,
  value,
  onChange,
  disabled,
  className,
}: FieldProps) {
  return (
    <Label className={cn('block', className)}>
      <span className="mb-2 block">
        {label}
      </span>
      <UiTextarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={4}
      />
    </Label>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  disabled,
  options,
}: FieldProps & { options: Array<[string, string]> }) {
  return (
    <Label className="block">
      <span className="mb-2 block">
        {label}
      </span>
      <UiSelect
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </UiSelect>
    </Label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border-soft bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {label}
      </p>
      <p className="mt-2 break-words text-sm leading-6 text-text-main">
        {value || '-'}
      </p>
    </div>
  );
}
