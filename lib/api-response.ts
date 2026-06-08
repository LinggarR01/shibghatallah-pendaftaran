// lib/api-response.ts
import { NextResponse } from 'next/server';

export function jsonResponse(data: unknown, status = 200) {
  return new NextResponse(
    JSON.stringify(data, (_, value) =>
      typeof value === 'bigint' ? value.toString() : value,
    ),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
}
