import { NextResponse } from 'next/server';
import { signup } from '@/models/auth';
import { SignupFormData } from '@/types/authTypes';

export async function POST(request: Request) {
  try {
    const signupData: SignupFormData = await request.json();

    // Validate required fields
    if (!signupData.email || !signupData.password || !signupData.name) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const result = await signup(signupData);

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
      { status: 201 }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { message: 'Signup failed', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}