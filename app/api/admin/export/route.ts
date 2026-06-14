import { NextRequest } from 'next/server';
import {
  buildPendaftarExportFileName,
  createPendaftarExportWorkbook,
} from '@/lib/export/pendaftar';
import { getAuthUser } from '@/lib/utils';
import { pendaftarExportQuerySchema } from '@/lib/validations/export';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();

    if (!authUser) {
      return Response.json(
        { success: false, message: 'Anda harus login terlebih dahulu' },
        { status: 401 },
      );
    }

    if (authUser.peran !== 'admin') {
      return Response.json(
        { success: false, message: 'Hanya admin yang dapat export data' },
        { status: 403 },
      );
    }

    const parsedQuery = pendaftarExportQuerySchema.safeParse({
      search: request.nextUrl.searchParams.get('search') ?? undefined,
      status: request.nextUrl.searchParams.get('status') ?? undefined,
    });

    if (!parsedQuery.success) {
      return Response.json(
        {
          success: false,
          message:
            parsedQuery.error.issues[0]?.message ??
            'Parameter export tidak valid',
        },
        { status: 400 },
      );
    }

    const workbook = await createPendaftarExportWorkbook(parsedQuery.data);
    const fileName = buildPendaftarExportFileName();

    return new Response(workbook, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'private, no-store',
      },
    });
  } catch (error) {
    console.error('EXPORT_PENDAFTAR_ERROR:', error);

    return Response.json(
      { success: false, message: 'Export data gagal diproses' },
      { status: 500 },
    );
  }
}
