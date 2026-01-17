import { NextRequest, NextResponse } from 'next/server';

/**
 * This API route has been disabled.
 */
export async function POST(req: NextRequest) {
  return NextResponse.json({ message: 'This feature is not available.' }, { status: 404 });
}
