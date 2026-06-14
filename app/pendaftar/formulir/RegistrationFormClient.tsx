'use client';

import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Save, Send } from 'lucide-react';
import { Alert } from '@/app/components/ui/Alert';
import { Button } from '@/app/components/ui/Button';
import { Card, CardContent } from '@/app/components/ui/Card';
import { FormSection } from '@/app/components/ui/FormSection';
import { Input as UiInput } from '@/app/components/ui/Input';
import { Label } from '@/app/components/ui/Label';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { Select as UiSelect } from '@/app/components/ui/Select';
import { Skeleton } from '@/app/components/ui/Skeleton';
import { Textarea as UiTextarea } from '@/app/components/ui/Textarea';
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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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
        setError(payload.message || 'Permintaan gagal diproses');
        return;
      }

      setStatus(payload.data?.status ?? status);
      setMessage(successMessage);
    } catch {
      setError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setSaving(false);
    }
  }

  function handleSaveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!readonly) {
      void submitRequest('/api/pendaftaran/current', 'Draft berhasil disimpan');
    }
  }

  function handleSubmitRegistration() {
    if (!readonly) {
      void submitRequest(
        '/api/pendaftaran/current/submit',
        'Pendaftaran berhasil disubmit',
      );
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

      <FormSection title="Data Calon Santri">
        <Input label="Nama lengkap *" name="fullName" value={form.fullName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK *" name="nik" value={form.nik} onChange={handleChange} disabled={readonly} maxLength={16} />
        <Input label="NISN" name="nisn" value={form.nisn} onChange={handleChange} disabled={readonly} />
        <Select label="Jenis kelamin *" name="gender" value={form.gender} onChange={handleChange} disabled={readonly} options={[['', 'Pilih'], ['laki_laki', 'Laki-laki'], ['perempuan', 'Perempuan']]} />
        <Input label="Tempat lahir *" name="birthPlace" value={form.birthPlace} onChange={handleChange} disabled={readonly} />
        <Input label="Tanggal lahir *" name="birthDate" type="date" value={form.birthDate} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP santri" name="phone" value={form.phone} onChange={handleChange} disabled={readonly} />
        <Input label="Anak ke-" name="childOrder" type="number" value={form.childOrder} onChange={handleChange} disabled={readonly} />
        <Input label="Jumlah saudara" name="siblingCount" type="number" value={form.siblingCount} onChange={handleChange} disabled={readonly} />
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
        <Input label="Kode pos" name="postalCode" value={form.postalCode} onChange={handleChange} disabled={readonly} />
      </FormSection>

      <FormSection title="Data Orang Tua/Wali">
        <Input label="Nama ayah *" name="fatherName" value={form.fatherName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK ayah" name="fatherNik" value={form.fatherNik} onChange={handleChange} disabled={readonly} maxLength={16} />
        <Input label="Pekerjaan ayah" name="fatherJob" value={form.fatherJob} onChange={handleChange} disabled={readonly} />
        <Input label="Pendidikan ayah" name="fatherEducation" value={form.fatherEducation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP ayah" name="fatherPhone" value={form.fatherPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Penghasilan ayah" name="fatherIncome" value={form.fatherIncome} onChange={handleChange} disabled={readonly} />
        <Input label="Nama ibu *" name="motherName" value={form.motherName} onChange={handleChange} disabled={readonly} />
        <Input label="NIK ibu" name="motherNik" value={form.motherNik} onChange={handleChange} disabled={readonly} maxLength={16} />
        <Input label="Pekerjaan ibu" name="motherJob" value={form.motherJob} onChange={handleChange} disabled={readonly} />
        <Input label="Pendidikan ibu" name="motherEducation" value={form.motherEducation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP ibu" name="motherPhone" value={form.motherPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Penghasilan ibu" name="motherIncome" value={form.motherIncome} onChange={handleChange} disabled={readonly} />
        <Input label="Nama wali" name="guardianName" value={form.guardianName} onChange={handleChange} disabled={readonly} />
        <Input label="Hubungan wali" name="guardianRelation" value={form.guardianRelation} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor HP wali" name="guardianPhone" value={form.guardianPhone} onChange={handleChange} disabled={readonly} />
        <Input label="Pekerjaan wali" name="guardianJob" value={form.guardianJob} onChange={handleChange} disabled={readonly} />
        <Textarea label="Alamat wali" name="guardianAddress" value={form.guardianAddress} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
      </FormSection>

      <FormSection title="Pendidikan Sebelumnya">
        <Input label="Asal sekolah *" name="schoolName" value={form.schoolName} onChange={handleChange} disabled={readonly} />
        <Input label="NPSN" name="npsn" value={form.npsn} onChange={handleChange} disabled={readonly} />
        <Textarea label="Alamat sekolah" name="schoolAddress" value={form.schoolAddress} onChange={handleChange} disabled={readonly} className="md:col-span-2" />
        <Input label="Tahun lulus" name="graduationYear" value={form.graduationYear} onChange={handleChange} disabled={readonly} />
        <Input label="Nomor ijazah" name="certificateNumber" value={form.certificateNumber} onChange={handleChange} disabled={readonly} />
      </FormSection>

      <Card className="sticky bottom-4 z-20">
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button type="submit" disabled={readonly || saving} variant="outline">
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Draft'}
          </Button>
          <Button
            type="button"
            onClick={handleSubmitRegistration}
            disabled={readonly || saving}>
            <Send className="h-4 w-4" />
            Submit Pendaftaran
          </Button>
        </CardContent>
      </Card>
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
}: FieldProps & { type?: string; maxLength?: number }) {
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
