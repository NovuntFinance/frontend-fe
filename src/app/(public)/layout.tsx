import Link from 'next/link';
import { ViewportPageLayout } from '@/components/layout/ViewportPageLayout';

/**
 * Layout for public/standalone pages (terms, privacy, about, etc.).
 * Keeps content inside the viewport with one scroll region — use for any new page
 * that isn't under dashboard or admin.
 */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewportPageLayout
      header={
        <div className="flex flex-shrink-0 items-center border-b border-white/10 bg-black/20 px-4 py-3">
          <Link
            href="/"
            className="text-primary text-sm font-medium hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      }
      mainClassName="p-4 md:p-6"
    >
      {children}
    </ViewportPageLayout>
  );
}
