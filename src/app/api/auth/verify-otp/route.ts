import { NextResponse } from 'next/server';
import { verifyOTP } from '@/models/auth';
import { VerifyOTPFormData } from '@/types/authTypes';

export async function POST(request: Request) {
  try {
    const verifyData: VerifyOTPFormData = await request.json();

    if (!verifyData.email || !verifyData.otp) {
      return NextResponse.json(
        { message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    const result = await verifyOTP(verifyData);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: result.message,
        user: result.user 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { message: 'OTP verification failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}