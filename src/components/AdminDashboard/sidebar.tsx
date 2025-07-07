'use client';

import {
  Home, BarChart3, Users, Mail, Briefcase, FileText,
  Calendar, X, Users2, MessageSquare,
  ClipboardList, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface SidebarItem {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({
      redirect: false,
      callbackUrl: '/auth/login'
    });
    router.push('/auth/login');
    window.location.reload();
  };

  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/dashboard' },
    { icon: Users2, label: 'Team', href: '/team' },
    { icon: MessageSquare, label: 'Testimonials', href: '/testimonial' },
    { icon: BarChart3, label: 'Expertise', href: '/expertise' },
    { icon: Mail, label: 'Contact', href: '/contact' },
    { icon: Briefcase, label: 'Projects', href: '/project' },
    { icon: FileText, label: 'Blogs', href: '/blog' },
    { icon: Calendar, label: 'Events', href: '/event' },
    { icon: ClipboardList, label: 'Jobs', href: '/job' },
    { icon: Users, label: 'Clients', href: '/client' },
  ];

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out flex flex-col`}
      >
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-semibold">EurosHub AdminPanel</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${pathname === item.href ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-700'}`}
                onClick={(e) => {
                  setSidebarOpen(false);
                  if (pathname === item.href) {
                    e.preventDefault();
                    window.location.href = item.href;
                  }
                }}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="mt-auto flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}