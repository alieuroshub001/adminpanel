// next.d.ts
import 'next';

declare module 'next' {
  interface PageProps {
    params: { slug: string };
    searchParams?: { [key: string]: string | string[] | undefined };
  }
}