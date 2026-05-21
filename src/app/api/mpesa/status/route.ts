import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const statusFilePath = path.join(process.cwd(), 'mpesa_status.json');

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkoutRequestId = searchParams.get('checkoutRequestId');

  if (!checkoutRequestId) {
    return NextResponse.json({ error: 'checkoutRequestId is required' }, { status: 400 });
  }

  let status = 'PENDING';

  // Try database query first
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const user = await prisma.user.findUnique({
      where: { checkoutRequestId }
    });
    if (user) {
      status = user.status;
    }
  } catch (dbError) {
    console.warn("DB status query skipped/failed, falling back to local file:", dbError);
    // Fallback to local file store
    if (fs.existsSync(statusFilePath)) {
      try {
        const statusStore = JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
        if (statusStore[checkoutRequestId]) {
          status = statusStore[checkoutRequestId];
        }
      } catch (e) {
        console.error("Error reading status file", e);
      }
    }
  }

  return NextResponse.json({ status });
}
