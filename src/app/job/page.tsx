import { Suspense } from 'react';
import JobManagement from '@/components/Jobs/Management';

// Loading component for the suspense fallback
function JobManagementLoading() {
  return (
    <div className="flex justify-center py-8">
      Loading...
    </div>
  );
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<JobManagementLoading />}>
      <JobManagement />
    </Suspense>
  );
}