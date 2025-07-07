import { Collection, Db, ObjectId } from 'mongodb';
import clientPromise from '../lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendOTPEmail, sendPasswordResetEmail } from '@/lib/email';
import { UserDB, SignupFormData, LoginFormData, VerifyOTPFormData, RequestPasswordResetFormData, ResetPasswordFormData } from '../types/authTypes';

const SALT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;

let cachedDb: Db;
let cachedUsers: Collection<UserDB>;

// Add these missing type definitions
type User = {
  _id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
};

async function connectToDatabase() {
  if (cachedDb && cachedUsers) {
    return { db: cachedDb, usersCollection: cachedUsers };
  }

  const client = await clientPromise;
  const db = client.db();
  cachedDb = db;
  cachedUsers = db.collection<UserDB>('users');

  await cachedUsers.createIndex({ email: 1 }, { unique: true });
  await cachedUsers.createIndex({ otpExpires: 1 }, { expireAfterSeconds: 0 });

  return { db, usersCollection: cachedUsers };
}

function toClientUser(user: UserDB): User {
  return {
    _id: user._id.toString(),
    email: user.email,
    name: user.name,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
}

export const signup = async (signupData: SignupFormData): Promise<AuthResponse> => {
  const { usersCollection } = await connectToDatabase();
  
  const existingUser = await usersCollection.findOne({ email: signupData.email });
  if (existingUser) {
    return { success: false, message: 'Email already in use' };
  }

  const passwordHash = await bcrypt.hash(signupData.password, SALT_ROUNDS);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const now = new Date();
  const result = await usersCollection.insertOne({
    _id: new ObjectId(),
    email: signupData.email,
    passwordHash,
    name: signupData.name,
    isVerified: false,
    otp,
    otpExpires,
    createdAt: now,
    updatedAt: now
  });

  // Updated to match the new email function signature
  await sendOTPEmail(otp);

  return { 
    success: true, 
    message: 'OTP sent to admin email for verification',
    user: toClientUser({
      ...signupData,
      _id: result.insertedId,
      passwordHash,
      isVerified: false,
      otp,
      otpExpires,
      createdAt: now,
      updatedAt: now
    })
  };
};

export const verifyOTP = async (verifyData: VerifyOTPFormData): Promise<AuthResponse> => {
  const { usersCollection } = await connectToDatabase();
  
  const user = await usersCollection.findOne({ 
    email: verifyData.email,
    otp: verifyData.otp,
    otpExpires: { $gt: new Date() }
  });

  if (!user) {
    return { success: false, message: 'Invalid or expired OTP' };
  }

  await usersCollection.updateOne(
    { _id: user._id },
    { 
      $set: { isVerified: true, updatedAt: new Date() },
      $unset: { otp: "", otpExpires: "" }
    }
  );

  return { 
    success: true, 
    message: 'Email verified successfully',
    user: toClientUser({
      ...user,
      isVerified: true,
      updatedAt: new Date()
    })
  };
};

export const login = async (loginData: LoginFormData): Promise<AuthResponse> => {
  const { usersCollection } = await connectToDatabase();
  
  const user = await usersCollection.findOne({ email: loginData.email });
  if (!user) {
    return { success: false, message: 'Invalid credentials' };
  }

  if (!user.isVerified) {
    return { success: false, message: 'Email not verified' };
  }

  const passwordMatch = await bcrypt.compare(loginData.password, user.passwordHash);
  if (!passwordMatch) {
    return { success: false, message: 'Invalid credentials' };
  }

  const token = generateAuthToken({ userId: user._id.toString() });

  return { 
    success: true, 
    message: 'Login successful',
    token,
    user: toClientUser(user)
  };
};

export const requestPasswordReset = async (resetData: RequestPasswordResetFormData): Promise<AuthResponse> => {
  const { usersCollection } = await connectToDatabase();
  
  const user = await usersCollection.findOne({ email: resetData.email });
  if (!user) {
    return { success: false, message: 'If this email exists, a reset link has been sent' };
  }

  const resetToken = uuidv4();
  const resetTokenExpires = new Date(Date.now() + 3600000);

  await usersCollection.updateOne(
    { _id: user._id },
    { 
      $set: { 
        resetToken,
        resetTokenExpires,
        updatedAt: new Date() 
      }
    }
  );

  // Updated to match the new email function signature
  await sendPasswordResetEmail(resetToken);

  return { 
    success: true, 
    message: 'Password reset link sent to admin email'
  };
};

export const resetPassword = async (resetData: ResetPasswordFormData): Promise<AuthResponse> => {
  const { usersCollection } = await connectToDatabase();
  
  const user = await usersCollection.findOne({ 
    resetToken: resetData.token,
    resetTokenExpires: { $gt: new Date() }
  });

  if (!user) {
    return { success: false, message: 'Invalid or expired token' };
  }

  const passwordHash = await bcrypt.hash(resetData.newPassword, SALT_ROUNDS);

  await usersCollection.updateOne(
    { _id: user._id },
    { 
      $set: { 
        passwordHash,
        updatedAt: new Date() 
      },
      $unset: { 
        resetToken: "",
        resetTokenExpires: "" 
      }
    }
  );

  return { 
    success: true, 
    message: 'Password reset successfully'
  };
};

function generateAuthToken({ }: { userId: string; }): string {
  // Implement JWT token generation here
  return 'generated.jwt.token';
}