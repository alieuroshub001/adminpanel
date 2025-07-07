import { NextResponse } from 'next/server';
import { resetPassword } from '@/models/auth';
import { ResetPasswordFormData } from '@/types/authTypes';

export async function POST(request: Request) {
  try {
    const resetData: ResetPasswordFormData = await request.json();

    if (!resetData.token || !resetData.newPassword) {
      return NextResponse.json(
        { message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    const result = await resetPassword(resetData);

    if (!result.success) {
      return NextResponse.json(
        { message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: result.message
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { message: 'Password reset failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}