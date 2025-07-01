'use client';

import { 
  Users2,
  MessageSquare,
  Briefcase,
  FileText,
  Calendar,
  Bookmark,
  Menu,
  Search,
  Bell,
  Plus,
  Activity,
  ClipboardList,
  Mail,
  ChevronRight
} from 'lucide-react';

interface WebsiteStat {
  title: string;
  value: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  action: string;
}

interface RecentActivity {
  id: number;
  type: string;
  title: string;
  author: string;
  date: string;
}

interface DashboardContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardContent({ sidebarOpen, setSidebarOpen }: DashboardContentProps) {
  // Sample data for the company website
  const websiteStats: WebsiteStat[] = [
    { title: "Team Members", value: "24", icon: Users2, action: "Add Member" },
    { title: "Testimonials", value: "15", icon: MessageSquare, action: "Add Testimonial" },
    { title: "Active Projects", value: "8", icon: Briefcase, action: "New Project" },
    { title: "Upcoming Events", value: "3", icon: Calendar, action: "Schedule Event" }
  ];

  const recentActivities: RecentActivity[] = [
    { id: 1, type: "Blog Post", title: "How we improved our workflow", author: "Sarah Johnson", date: "2 hours ago" },
    { id: 2, type: "Team Member", title: "New hire: Mark Williams", author: "HR Department", date: "1 day ago" },
    { id: 3, type: "Project", title: "Client website redesign", author: "Design Team", date: "2 days ago" },
    { id: 4, type: "Event", title: "Annual company meetup", author: "Events Team", date: "1 week ago" }
  ];

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-md"
            >
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Website Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search content..."
                className="input pl-10 w-64"
              />
            </div>
            
            <button className="p-2 hover:bg-gray-100 rounded-md relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </header>
 
      {/* Dashboard Content */}
      <main className="p-4 lg:p-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {websiteStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <stat.icon size={24} className="text-blue-600" />
                </div>
              </div>
              <button className="mt-4 text-sm font-medium text-blue-600 flex items-center">
                <Plus size={16} className="mr-1" />
                {stat.action}
              </button>
            </div>
          ))}
        </div>

        {/* Content Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Content Status */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Content Overview</h3>
              <p className="text-gray-500">Recent updates across your website</p>
            </div>
            <div className="space-y-4">
              {recentActivities.map(activity => (
                <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                    {activity.type === "Blog Post" && <FileText size={18} className="text-gray-600" />}
                    {activity.type === "Team Member" && <Users2 size={18} className="text-gray-600" />}
                    {activity.type === "Project" && <Briefcase size={18} className="text-gray-600" />}
                    {activity.type === "Event" && <Calendar size={18} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.type} • {activity.author}</p>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap ml-4">
                    {activity.date}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold">Website Analytics</h3>
              <p className="text-gray-500">Last 30 days performance</p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Activity className="text-green-500 mr-2" size={18} />
                  <span className="text-sm font-medium">Visitors</span>
                </div>
                <span className="text-lg font-bold">1,240</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ClipboardList className="text-blue-500 mr-2" size={18} />
                  <span className="text-sm font-medium">Page Views</span>
                </div>
                <span className="text-lg font-bold">3,850</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Mail className="text-purple-500 mr-2" size={18} />
                  <span className="text-sm font-medium">Contact Forms</span>
                </div>
                <span className="text-lg font-bold">42</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bookmark className="text-orange-500 mr-2" size={18} />
                  <span className="text-sm font-medium">Blog Reads</span>
                </div>
                <span className="text-lg font-bold">1,028</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Management CTA */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-gray-900">Manage Your Website Content</h3>
              <p className="text-gray-500 mt-1">
                Update team members, projects, blogs, and more from the admin panel
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md whitespace-nowrap flex items-center">
              Explore Content Sections
              <ChevronRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}