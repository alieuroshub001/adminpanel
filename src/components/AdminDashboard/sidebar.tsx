'use client';

import { 
  Home,
  BarChart3,
  Users,
  Mail,
  Briefcase,
  FileText,
  Calendar,
  Settings,
  LogOut,
  X,
  Users2,
  MessageSquare,
  ClipboardList,
  Bookmark
} from 'lucide-react';
import { useState } from 'react';

interface SidebarItem {
  icon: any;
  label: string;
  active?: boolean;
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: Users2, label: "Team" }, // Changed to Users2 for team members
    { icon: MessageSquare, label: "Testimonials" }, // Better for testimonials
    { icon: Mail, label: "Contact" }, // Mail icon for contact
    { icon: Briefcase, label: "Projects" }, // Briefcase for projects
    { icon: FileText, label: "Blogs" }, // Kept FileText for blogs
    { icon: Calendar, label: "Events" }, // Calendar for events
    { icon: ClipboardList, label: "Jobs" }, // Clipboard for jobs
    { icon: Users, label: "Clients" }, // Users for clients
    { icon: Settings, label: "Settings" }
  ];

  return (
    <>
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h2 className="text-lg font-semibold">AdminPanel</h2>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {sidebarItems.map((item, index) => (
              <a
                key={index}
                href="#"
                className={`sidebar-item ${item.active ? 'active' : ''}`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </a>
            ))}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <button className="sidebar-item w-full">
              <LogOut size={20} className="mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}