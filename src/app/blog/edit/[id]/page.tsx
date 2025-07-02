// src/app/admin/blogs/edit/[id]/page.tsx
import BlogPostForm from '@/components/Blogs/Form';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditBlogPostPage({ params }: PageProps) {
  // Await the params Promise
  const { id } = await params;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/blogs/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to fetch blog post data');
  }

  const data = await response.json();

  return <BlogPostForm initialData={data} isEditing />;
}