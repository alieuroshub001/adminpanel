import SignupForm from '@/components/AdminDashboard/signup';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Signup',
  description: 'Create a new admin account',
};

export default function SignupPage() {
  return (
    <main className="min-h-screen">
      <SignupForm />
    </main>
  );
}