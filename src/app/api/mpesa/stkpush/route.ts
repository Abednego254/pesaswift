import { NextResponse } from 'next/server';

function getTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

async function getOAuthToken() {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
    },
    // Prevent caching for this server-side fetch
    cache: 'no-store'
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("M-PESA Token Error:", data);
    throw new Error('Failed to generate M-PESA access token');
  }
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { phone, trackingId } = await request.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Format phone number to 254XXXXXXXXX
    let formattedPhone = phone.replace(/\s+/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = `254${formattedPhone.substring(1)}`;
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }

    // Amount is hardcoded to 1 for Safaricom Sandbox testing, as requested.
    const amount = 1; 

    const shortcode = process.env.MPESA_SHORTCODE!;
    const passkey = process.env.MPESA_PASSKEY!;
    const callbackUrl = process.env.MPESA_CALLBACK_URL!.replace(/['"]/g, '');

    const timestamp = getTimestamp();
    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');

    const token = await getOAuthToken();

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: trackingId || 'LoanVerification',
      TransactionDesc: 'Loan Verification Fee'
    };

    const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });

    const stkData = await stkResponse.json();

    if (!stkResponse.ok) {
      console.error("STK Push Failed:", stkData);
      return NextResponse.json({ error: 'Failed to initiate STK push', details: stkData }, { status: 400 });
    }

    // Save CheckoutRequestID to database if trackingId is present
    const checkoutRequestId = stkData.CheckoutRequestID;
    if (checkoutRequestId && trackingId) {
      try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.user.update({
          where: { trackingId },
          data: { checkoutRequestId }
        });
        console.log(`Associated checkoutRequestId ${checkoutRequestId} with trackingId ${trackingId} in DB`);
      } catch (dbError) {
        console.error("Failed to associate checkoutRequestId in DB:", dbError);
      }
    }

    return NextResponse.json({ success: true, data: stkData });

  } catch (error: any) {
    console.error("STK Push API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
