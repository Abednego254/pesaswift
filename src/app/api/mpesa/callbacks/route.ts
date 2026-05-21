import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const statusFilePath = path.join(process.cwd(), 'mpesa_status.json');

export async function POST(request: Request) {
  try {
    const callbackData = await request.json();
    
    console.log("==========================================");
    console.log("M-PESA CALLBACK RECEIVED:");
    console.log(JSON.stringify(callbackData, null, 2));
    console.log("==========================================");

    const stkCallback = callbackData.Body?.stkCallback;
    const resultCode = stkCallback?.ResultCode;
    const resultDesc = stkCallback?.ResultDesc;
    const checkoutRequestId = stkCallback?.CheckoutRequestID;

    // Read existing status file or create empty
    let statusStore: Record<string, string> = {};
    if (fs.existsSync(statusFilePath)) {
      statusStore = JSON.parse(fs.readFileSync(statusFilePath, 'utf-8'));
    }

    const finalStatus = resultCode === 0 ? 'SUCCESS' : 'FAILED';

    if (resultCode === 0 && checkoutRequestId) {
      console.log(`✅ Payment Successful! CheckoutRequestID: ${checkoutRequestId}`);
      statusStore[checkoutRequestId] = 'SUCCESS';
    } else {
      console.log(`❌ Payment Failed/Cancelled: ${resultDesc}`);
      if (checkoutRequestId) {
         statusStore[checkoutRequestId] = 'FAILED';
      }
    }

    // Save to database
    if (checkoutRequestId) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.user.update({
          where: { checkoutRequestId },
          data: { status: finalStatus }
        });
        console.log(`Updated user status to ${finalStatus} in DB for checkoutRequestId ${checkoutRequestId}`);
      } catch (dbError) {
        console.error("Failed to update status in DB:", dbError);
      }
    }

    // Save to file
    fs.writeFileSync(statusFilePath, JSON.stringify(statusStore));

    return NextResponse.json({ ResultCode: 0, ResultDesc: "Success" });

  } catch (error) {
    console.error("Error processing callback:", error);
    return NextResponse.json({ ResultCode: 1, ResultDesc: "Internal Server Error" }, { status: 500 });
  }
}
