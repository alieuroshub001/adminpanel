'use client';

import './globals.css';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Sidebar from '@/components/AdminDashboard/sidebar';
import { Menu } from 'lucide-react';
import { useState } from 'react';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });



export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Sidebar open by default

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="min-h-screen bg-gray-50 flex">
          {/* Sidebar */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            {/* Topbar always visible with Menu toggle */}
            <div className="p-4 border-b flex items-center bg-white sticky top-0 z-10">
              {!sidebarOpen && (
                <button onClick={() => setSidebarOpen(true)} className="p-2 rounded hover:bg-gray-100">
                  <Menu size={24} />
                </button>
              )}
              <h1 className="ml-4 text-lg font-semibold">Euroshub Admin Panel</h1>
            </div>

            <div className="p-4">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
