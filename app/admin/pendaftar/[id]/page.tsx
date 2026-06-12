import Link from 'next/link';
import { notFound } from 'next/navigation';
import StatusBadge from '@/app/components/ui/StatusBadge';
import { getDocumentLabel } from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import StatusUpdateForm from './StatusUpdateForm';
import { JenisDokumen } from '@prisma/client';

export const dynamic = 'force-dynamic';

type RegistrationDocument = {
  id: bigint;
  jenisDokumen: JenisDokumen;
  namaFile: string;
};

type AdminPendaftarDetailPageProps = {
  params: Promise<{ id: string }>;
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm text-slate-900">{value || '-'}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default async function AdminPendaftarDetailPage({
  params,
}: AdminPendaftarDetailPageProps) {
  const { id } = await params;
  const registration = await prisma.pendaftaran.findUnique({
    where: { id: BigInt(id) },
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
      <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <Link
          href="/admin/pendaftar"
          className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
          Kembali ke daftar
        </Link>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {registration.nomorPendaftaran}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              {registration.profilSantri?.namaLengkap ??
                registration.pengguna.nama}
            </h1>
          </div>
          <StatusBadge status={registration.status} />
        </div>
      </div>

      <Section title="Data Akun">
        <Row label="Nama akun" value={registration.pengguna.nama} />
        <Row label="Email" value={registration.pengguna.email} />
        <Row label="Nomor HP" value={registration.pengguna.noHp} />
        <Row label="Role" value={registration.pengguna.peran} />
      </Section>

      <Section title="Data Santri">
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
      </Section>

      <Section title="Data Orang Tua/Wali">
        <Row label="Nama ayah" value={registration.profilOrangTua?.namaAyah} />
        <Row label="HP ayah" value={registration.profilOrangTua?.noHpAyah} />
        <Row label="Nama ibu" value={registration.profilOrangTua?.namaIbu} />
        <Row label="HP ibu" value={registration.profilOrangTua?.noHpIbu} />
        <Row label="Nama wali" value={registration.profilOrangTua?.namaWali} />
        <Row label="HP wali" value={registration.profilOrangTua?.noHpWali} />
      </Section>

      <Section title="Pendidikan Sebelumnya">
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
      </Section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">Dokumen</h2>
        {registration.dokumen.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">Belum ada dokumen.</p>
        ) : (
          <div className="mt-4 grid gap-3">
            {registration.dokumen.map((document: RegistrationDocument) => (
              <div
                key={document.id.toString()}
                className="flex flex-col gap-3 rounded-md border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-slate-950">
                    {getDocumentLabel(document.jenisDokumen)}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {document.namaFile}
                  </p>
                </div>
                <a
                  href={`/api/documents/${document.id.toString()}?download=1`}
                  className="rounded-md border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-950">
          Verifikasi Status
        </h2>
        <div className="mt-4">
          <StatusUpdateForm
            registrationId={registration.id.toString()}
            currentStatus={registration.status}
            currentNote={registration.catatanAdmin}
          />
        </div>
      </section>
    </div>
  );
}
