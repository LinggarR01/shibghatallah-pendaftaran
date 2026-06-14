import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getDocumentLabel, type JenisDokumen } from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import StatusUpdateForm from './StatusUpdateForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/Card';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { FormSection } from '@/app/components/ui/FormSection';
import { PageHeader } from '@/app/components/ui/PageHeader';

export const dynamic = 'force-dynamic';

type AdminPendaftarDetailPageProps = {
  params: Promise<{ id: string }>;
};

type RegistrationDocument = {
  id: bigint;
  jenisDokumen: JenisDokumen;
  namaFile: string;
};

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
      profilSantri: true,
      profilOrangTua: true,
      sekolahSebelumnya: true,
      dokumen: { orderBy: { diunggahPada: 'desc' } },
    },
  });

  if (!registration) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow={registration.nomorPendaftaran}
        title={registration.profilSantri?.namaLengkap ?? registration.pengguna.nama}
        description="Tinjau data pendaftaran, cek dokumen, lalu perbarui status verifikasi."
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

      <FormSection title="Data Akun">
        <Row label="Nama akun" value={registration.pengguna.nama} />
        <Row label="Email" value={registration.pengguna.email} />
        <Row label="Nomor HP" value={registration.pengguna.noHp} />
        <Row label="Role" value={registration.pengguna.peran} />
      </FormSection>

      <FormSection title="Data Calon Santri">
        <Row label="Nama lengkap" value={registration.profilSantri?.namaLengkap} />
        <Row label="NIK" value={registration.profilSantri?.nik} />
        <Row label="NISN" value={registration.profilSantri?.nisn} />
        <Row label="Jenis kelamin" value={registration.profilSantri?.jenisKelamin} />
        <Row label="Tempat lahir" value={registration.profilSantri?.tempatLahir} />
        <Row
          label="Tanggal lahir"
          value={registration.profilSantri?.tanggalLahir?.toLocaleDateString('id-ID')}
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

      <FormSection title="Data Orang Tua/Wali">
        <Row label="Nama ayah" value={registration.profilOrangTua?.namaAyah} />
        <Row label="HP ayah" value={registration.profilOrangTua?.noHpAyah} />
        <Row label="Nama ibu" value={registration.profilOrangTua?.namaIbu} />
        <Row label="HP ibu" value={registration.profilOrangTua?.noHpIbu} />
        <Row label="Nama wali" value={registration.profilOrangTua?.namaWali} />
        <Row label="HP wali" value={registration.profilOrangTua?.noHpWali} />
      </FormSection>

      <FormSection title="Data Pendidikan">
        <Row label="Asal sekolah" value={registration.sekolahSebelumnya?.namaSekolah} />
        <Row label="NPSN" value={registration.sekolahSebelumnya?.npsn} />
        <Row label="Tahun lulus" value={registration.sekolahSebelumnya?.tahunLulus} />
        <Row label="Nomor ijazah" value={registration.sekolahSebelumnya?.nomorIjazah} />
        <Row label="Alamat sekolah" value={registration.sekolahSebelumnya?.alamatSekolah} />
      </FormSection>

      <Card>
        <CardHeader>
          <CardTitle>Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          {registration.dokumen.length === 0 ? (
            <EmptyState title="Belum ada dokumen." />
          ) : (
            <div className="grid gap-3">
              {registration.dokumen.map((document: RegistrationDocument) => (
                <div
                  key={document.id.toString()}
                  className="flex flex-col gap-3 rounded-2xl border border-border-soft bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary">
                      <FileText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-text-main">
                        {getDocumentLabel(document.jenisDokumen)}
                      </p>
                      <p className="mt-1 text-sm text-text-muted">
                        {document.namaFile}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/documents/${document.id.toString()}?download=1`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border-soft bg-white px-3 text-sm font-semibold text-primary hover:bg-secondary">
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
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
