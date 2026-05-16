import { NextResponse } from 'next/server';

export function GET(): NextResponse {
  return NextResponse.json({
    ok: true,
    ts: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
  });
}
