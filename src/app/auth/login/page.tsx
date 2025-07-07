import LoginForm from '@/components/AdminDashboard/login';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login',
  description: 'Login to access the admin dashboard',
};

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <LoginForm />
    </main>
  );
}