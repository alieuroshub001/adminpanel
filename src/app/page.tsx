'use client';

import { useEffect, useState } from 'react';
import Dashboard from '../components/AdminDashboard/dashboard';
import { Loader2 } from 'lucide-react';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600" />
      <p className="text-sm text-muted-foreground">Loading dashboard...</p>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ error, retry }: { error: string; retry: () => void }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center max-w-md mx-auto p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h2>
        <p className="text-sm text-red-600">{error}</p>
      </div>
      <button 
        onClick={retry}
        className="btn btn-primary"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Auth check hook simulation
const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Simulate authentication check
    const checkAuth = async () => {
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // For demo purposes, always authenticate
        // In real app, this would check tokens/session
        setIsAuthenticated(true);
        setUser({
          id: '1',
          name: 'Admin User',
          email: 'admin@example.com',
          role: 'admin'
        });
      } catch (error) {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  return { isAuthenticated, user };
};

// Login component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate login process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In a real app, this would make an API call
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-header text-center">
            <h1 className="card-title text-2xl">Admin Login</h1>
            <p className="card-description">Enter your credentials to access the dashboard</p>
          </div>
          <div className="card-content">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
          <div className="card-footer">
            <p className="text-xs text-muted-foreground text-center">
              Demo: Use any email and password to login
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main page component
export default function AdminPage() {
  const { isAuthenticated, user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Error boundary simulation
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const retryLoad = () => {
    setError(null);
    window.location.reload();
  };

  // Show loading screen while checking authentication
  if (isAuthenticated === null) {
    return <LoadingScreen />;
  }

  // Show error screen if there's an error
  if (error) {
    return <ErrorScreen error={error} retry={retryLoad} />;
  }

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Show dashboard if authenticated
  return (
    <div className="admin-wrapper">
      {/* Optional: Add global admin context */}
      <div className="admin-content">
        <Dashboard />
      </div>
      
      {/* Optional: Add global notifications/toasts */}
      <div id="notifications-root" className="fixed top-4 right-4 z-50 space-y-2">
        {/* Notifications would be rendered here */}
      </div>
    </div>
  );
}



// Optional: Add error boundary for production
export function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600 mb-3">
            The dashboard encountered an unexpected error.
          </p>
          <details className="text-xs text-red-500 text-left">
            <summary className="cursor-pointer mb-2">Error details</summary>
            <pre className="whitespace-pre-wrap break-words bg-red-100 p-2 rounded">
              {error.message}
            </pre>
          </details>
        </div>
        <div className="space-x-2">
          <button onClick={reset} className="btn btn-primary">
            Try Again
          </button>
          <button onClick={() => window.location.href = '/'} className="btn btn-outline">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}