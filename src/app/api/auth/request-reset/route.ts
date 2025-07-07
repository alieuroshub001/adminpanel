import { NextResponse } from 'next/server';
import { requestPasswordReset } from '@/models/auth';
import { RequestPasswordResetFormData } from '@/types/authTypes';

export async function POST(request: Request) {
  try {
    const resetData: RequestPasswordResetFormData = await request.json();

    if (!resetData.email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await requestPasswordReset(resetData);

    return NextResponse.json(
      { 
        success: result.success,
        message: result.message
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { message: 'Password reset request failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}