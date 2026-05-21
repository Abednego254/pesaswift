import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, phone, idNumber, loanType } = body;

    if (!name || !phone || !idNumber) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (!phone.match(/^(07|01)\d{8}$/)) {
      return NextResponse.json({ error: 'Invalid M-PESA number format. E.g. 0712345678' }, { status: 400 });
    }

    if (idNumber.length < 6) {
      return NextResponse.json({ error: 'Invalid ID Number format.' }, { status: 400 });
    }

    // Randomized logic as requested
    const qualifiedAmt = Math.floor(5 + Math.random() * 45) * 1000;
    const trackingId = `LON-C${Math.floor(10000 + Math.random() * 90000)}L${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      // Attempt to save to database if configured
      await prisma.user.create({
        data: {
          trackingId,
          name,
          idNumber,
          mpesaNumber: phone,
          loanType: loanType || 'Personal Loan',
          qualifiedAmt,
          interestRate: 10,
          repaymentPeriod: 2,
          verificationFee: 120,
          status: 'PENDING'
        }
      });
    } catch (dbError) {
      // Graceful fallback if MySQL is not yet configured by the user
      console.warn("Database save skipped or failed. Using mock data.", dbError);
    }

    return NextResponse.json({
      success: true,
      data: {
        trackingId,
        name,
        mpesaNumber: phone,
        idNumber,
        loanType: loanType || 'Personal Loan',
        qualifiedAmt,
        verificationFee: 120,
        interestRate: 10,
        repaymentPeriod: 2, // months
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'An unexpected error occurred processing your request.' }, { status: 500 });
  }
}
