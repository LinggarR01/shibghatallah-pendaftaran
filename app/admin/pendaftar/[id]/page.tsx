import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarDays, FileCheck2, Mail, Phone, type LucideIcon } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import {
  documentDefinitions,
  getDocumentLabel,
  type JenisDokumen,
} from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import StatusUpdateForm from './StatusUpdateForm';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/Card';
import { Alert } from '@/app/components/ui/Alert';
import { Badge } from '@/app/components/ui/Badge';
import { DocumentUploadCard } from '@/app/components/ui/DocumentUploadCard';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { FormSection } from '@/app/components/ui/FormSection';
import { PageHeader } from '@/app/components/ui/PageHeader';
import { getRegistrationStatusDescription } from '@/lib/registration';

export const dynamic = 'force-dynamic';

type AdminPendaftarDetailPageProps = {
  params: Promise<{ id: string }>;
};

type RegistrationDocument = {
  id: bigint;
  jenisDokumen: JenisDokumen;
  namaFile: string;
  tipeFile: string | null;
  ukuranFile: bigint | null;
  statusVerifikasi: string;
  diunggahPada: Date;
};

function formatFileSize(value: bigint | null) {
  if (!value) return '-';
  return `${(Number(value) / 1024 / 1024).toFixed(2)} MB`;
}

function formatDate(value: Date | null | undefined) {
  return value ? value.toLocaleDateString('id-ID') : '-';
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        {label}
      </p>
      <p className="mt-1 text-sm leading-6 text-text-main">{value || '-'}</p>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm text-text-muted">{label}</p>
          <p className="mt-1 break-words font-bold text-text-main">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AdminPendaftarDetailPage({
  params,
}: AdminPendaftarDetailPageProps) {
  const { id } = await params;
  let registrationId: bigint;

  try {
    registrationId = BigInt(id);
  } catch {
    notFound();
  }

  const registration = await prisma.pendaftaran.findUnique({
    where: { id: registrationId },
    include: {
      pengguna: {
        select: { nama: true, email: true, noHp: true, peran: true },
      },
      periode: true,
      profilSantri: true,
      profilOrangTua: true,
      sekolahSebelumnya: true,
      dokumen: { orderBy: { diunggahPada: 'desc' } },
    },
  });

  if (!registration) {
    notFound();
  }

  const requiredDocumentTypes = documentDefinitions
    .filter((definition) => definition.required)
    .map((definition) => definition.type);
  const uploadedDocumentTypes = new Set(
    registration.dokumen.map((document) => document.jenisDokumen),
  );
  const missingRequiredDocuments = requiredDocumentTypes.filter(
    (type) => !uploadedDocumentTypes.has(type),
  );
  const isDataComplete = Boolean(
    registration.profilSantri &&
      registration.profilOrangTua &&
      registration.sekolahSebelumnya,
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={registration.nomorPendaftaran}
        title={
          registration.profilSantri?.namaLengkap ?? registration.pengguna.nama
        }
        description={`${registration.periode.nama} - ${registration.periode.tahunAjaran}. ${getRegistrationStatusDescription(registration.status)}`}
        actions={
          <>
            <StatusBadge status={registration.status} />
            <Link
              href="/admin/pendaftar"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-4 text-sm font-semibold text-primary transition hover:bg-surface">
              <ArrowLeft className="h-4 w-4" />
              Kembali
            </Link>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={Mail}
          label="Email akun"
          value={registration.pengguna.email}
        />
        <InfoCard
          icon={Phone}
          label="Nomor HP"
          value={registration.pengguna.noHp ?? '-'}
        />
        <InfoCard
          icon={CalendarDays}
          label="Tanggal daftar"
          value={formatDate(registration.dibuatPada)}
        />
        <InfoCard
          icon={FileCheck2}
          label="Kelengkapan"
          value={
            isDataComplete
              ? missingRequiredDocuments.length === 0
                ? 'Data dan dokumen lengkap'
                : `${missingRequiredDocuments.length} dokumen wajib belum ada`
              : 'Data wajib belum lengkap'
          }
        />
      </div>

      {registration.status === 'perlu_revisi' && registration.catatanAdmin && (
        <Alert variant="warning">
          <h2 className="font-bold">Perlu Perbaikan</h2>
          <p className="mt-1">{registration.catatanAdmin}</p>
        </Alert>
      )}

      <Card>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              ['#ringkasan', 'Ringkasan'],
              ['#santri', 'Data Santri'],
              ['#orang-tua', 'Orang Tua/Wali'],
              ['#pendidikan', 'Pendidikan'],
              ['#dokumen', 'Dokumen'],
              ['#verifikasi', 'Verifikasi'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="inline-flex h-9 items-center rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-surface">
                {label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card id="ringkasan">
        <CardHeader>
          <CardTitle>Ringkasan Pemeriksaan</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <Row label="Nomor pendaftaran" value={registration.nomorPendaftaran} />
          <Row label="Periode" value={`${registration.periode.nama} - ${registration.periode.tahunAjaran}`} />
          <Row label="Tanggal dikirim" value={formatDate(registration.dikirimPada)} />
          <Row label="Tanggal diverifikasi" value={formatDate(registration.diverifikasiPada)} />
          <Row label="Kelengkapan data" value={isDataComplete ? 'Data lengkap' : 'Data belum lengkap'} />
          <Row
            label="Kelengkapan dokumen"
            value={
              missingRequiredDocuments.length === 0
                ? 'Dokumen wajib lengkap'
                : `${missingRequiredDocuments.length} dokumen wajib belum diunggah`
            }
          />
        </CardContent>
      </Card>

      <FormSection title="Data Akun">
        <Row label="Nama akun" value={registration.pengguna.nama} />
        <Row label="Email" value={registration.pengguna.email} />
        <Row label="Nomor HP" value={registration.pengguna.noHp} />
      </FormSection>

      <div id="santri">
      <FormSection title="Data Calon Santri">
        <Row
          label="Nama lengkap"
          value={registration.profilSantri?.namaLengkap}
        />
        <Row label="NIK" value={registration.profilSantri?.nik} />
        <Row label="NISN" value={registration.profilSantri?.nisn} />
        <Row
          label="Jenis kelamin"
          value={registration.profilSantri?.jenisKelamin}
        />
        <Row
          label="Tempat lahir"
          value={registration.profilSantri?.tempatLahir}
        />
        <Row
          label="Tanggal lahir"
          value={registration.profilSantri?.tanggalLahir?.toLocaleDateString(
            'id-ID',
          )}
        />
        <Row label="Alamat" value={registration.profilSantri?.alamat} />
        <Row
          label="Wilayah"
          value={[
            registration.profilSantri?.desa,
            registration.profilSantri?.kecamatan,
            registration.profilSantri?.kota,
            registration.profilSantri?.provinsi,
          ]
            .filter(Boolean)
            .join(', ')}
        />
      </FormSection>
      </div>

      <div id="orang-tua">
      <FormSection title="Data Orang Tua/Wali">
        <Row label="Nama ayah" value={registration.profilOrangTua?.namaAyah} />
        <Row label="HP ayah" value={registration.profilOrangTua?.noHpAyah} />
        <Row label="Nama ibu" value={registration.profilOrangTua?.namaIbu} />
        <Row label="HP ibu" value={registration.profilOrangTua?.noHpIbu} />
        <Row label="Nama wali" value={registration.profilOrangTua?.namaWali} />
        <Row label="HP wali" value={registration.profilOrangTua?.noHpWali} />
      </FormSection>
      </div>

      <div id="pendidikan">
      <FormSection title="Data Pendidikan">
        <Row
          label="Asal sekolah"
          value={registration.sekolahSebelumnya?.namaSekolah}
        />
        <Row label="NPSN" value={registration.sekolahSebelumnya?.npsn} />
        <Row
          label="Tahun lulus"
          value={registration.sekolahSebelumnya?.tahunLulus}
        />
        <Row
          label="Nomor ijazah"
          value={registration.sekolahSebelumnya?.nomorIjazah}
        />
        <Row
          label="Alamat sekolah"
          value={registration.sekolahSebelumnya?.alamatSekolah}
        />
      </FormSection>
      </div>

      <Card id="dokumen">
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Dokumen</CardTitle>
            <Badge variant={missingRequiredDocuments.length === 0 ? 'success' : 'warning'}>
              {missingRequiredDocuments.length === 0
                ? 'Dokumen wajib lengkap'
                : `${missingRequiredDocuments.length} belum diunggah`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {registration.dokumen.length === 0 ? (
            <EmptyState title="Belum ada dokumen." />
          ) : (
            <div className="grid gap-3">
              {registration.dokumen.map((document: RegistrationDocument) => (
                <DocumentUploadCard
                  key={document.id.toString()}
                  title={getDocumentLabel(document.jenisDokumen)}
                  existingFileName={document.namaFile}
                  existingFileSize={formatFileSize(document.ukuranFile)}
                  uploadedAt={formatDate(document.diunggahPada)}
                  statusLabel={document.statusVerifikasi.replaceAll('_', ' ')}
                  canEdit={false}
                  viewHref={`/api/documents/${document.id.toString()}`}
                  downloadHref={`/api/documents/${document.id.toString()}?download=1`}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="verifikasi">
        <CardHeader>
          <CardTitle>Verifikasi Pendaftar</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusUpdateForm
            registrationId={registration.id.toString()}
            currentStatus={registration.status}
            currentNote={registration.catatanAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
