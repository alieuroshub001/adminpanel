import { ObjectId } from 'mongodb';

// Database representation
export type UserDB = {
  _id: ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  isVerified: boolean;
  otp?: string;
  otpExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
};

// Client-safe representation
export type User = Omit<UserDB, '_id' | 'passwordHash' | 'otp' | 'otpExpires' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

// Form data type for signup
export type SignupFormData = {
  email: string;
  password: string;
  name: string;
};

// Form data type for login
export type LoginFormData = {
  email: string;
  password: string;
};

// Form data type for OTP verification
export type VerifyOTPFormData = {
  email: string;
  otp: string;
};

// Form data type for password reset request
export type RequestPasswordResetFormData = {
  email: string;
};

// Form data type for password reset
export type ResetPasswordFormData = {
  token: string;
  newPassword: string;
};

// Response type for auth operations
export type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
};