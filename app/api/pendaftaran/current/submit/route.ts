import { NextRequest } from 'next/server';
import { jsonResponse } from '@/lib/api-response';
import { documentDefinitions } from '@/lib/documents';
import { prisma } from '@/lib/prisma';
import { canEditRegistration } from '@/lib/registration';
import { getAuthUser } from '@/lib/utils';
import {
  getFirstRegistrationValidationMessage,
  registrationDraftSchema,
  validateRegistrationForSubmit,
} from '@/lib/validations/registration';

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return jsonResponse(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        401,
      );
    }

    if (authUser.peran !== 'pendaftar') {
      return jsonResponse(
        { success: false, message: 'Hanya pendaftar yang dapat submit' },
        403,
      );
    }

    const body = await request.json();
    const parsedBody = registrationDraftSchema.safeParse(body);

    if (!parsedBody.success) {
      return jsonResponse(
        {
          success: false,
          message: getFirstRegistrationValidationMessage(parsedBody.error),
          errors: parsedBody.error.flatten().fieldErrors,
        },
        400,
      );
    }

    const submitErrors = validateRegistrationForSubmit(parsedBody.data);
    if (submitErrors.length > 0) {
      return jsonResponse(
        {
          success: false,
          message: submitErrors[0],
          errors: submitErrors,
        },
        400,
      );
    }

    const saveResponse = await fetch(new URL('/api/pendaftaran/current', request.url), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') ?? '',
      },
      body: JSON.stringify(parsedBody.data),
    });

    const savePayload = await saveResponse.json();
    if (!saveResponse.ok) {
      return jsonResponse(savePayload, saveResponse.status);
    }

    const registration = await prisma.pendaftaran.findFirst({
      where: { penggunaId: BigInt(authUser.id) },
      orderBy: { dibuatPada: 'desc' },
    });

    if (!registration) {
      return jsonResponse(
        { success: false, message: 'Draft pendaftaran tidak ditemukan' },
        404,
      );
    }

    if (!canEditRegistration(registration.status)) {
      return jsonResponse(
        {
          success: false,
          message: `Pendaftaran dengan status ${registration.status} tidak dapat disubmit`,
        },
        403,
      );
    }

    const uploadedDocuments = await prisma.dokumenPendaftaran.findMany({
      where: { pendaftaranId: registration.id },
      select: { jenisDokumen: true },
    });
    const uploadedTypes = new Set(
      uploadedDocuments.map((document) => document.jenisDokumen),
    );
    const missingRequiredDocument = documentDefinitions.find(
      (definition) => definition.required && !uploadedTypes.has(definition.type),
    );

    if (missingRequiredDocument) {
      return jsonResponse(
        {
          success: false,
          message: `${missingRequiredDocument.label} wajib diunggah sebelum submit`,
        },
        400,
      );
    }

    const updatedRegistration = await prisma.pendaftaran.update({
      where: { id: registration.id },
      data: {
        status: 'menunggu_verifikasi',
        dikirimPada: new Date(),
        catatanAdmin: null,
      },
      include: {
        profilSantri: true,
        profilOrangTua: true,
        sekolahSebelumnya: true,
      },
    });

    return jsonResponse(
      {
        success: true,
        message: 'Pendaftaran berhasil disubmit',
        data: updatedRegistration,
      },
      200,
    );
  } catch (error) {
    console.error('SUBMIT_CURRENT_REGISTRATION_ERROR:', error);
    return jsonResponse(
      { success: false, message: 'Terjadi kesalahan pada server' },
      500,
    );
  }
}
