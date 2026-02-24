import Link from 'next/link';
import { ViewportPageLayout } from '@/components/layout/ViewportPageLayout';
import { PageContainer } from '@/components/layout/PageContainer';

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
        <PageContainer>
          <div className="flex flex-shrink-0 items-center border-b border-white/10 bg-black/20 py-3">
            <Link
              href="/"
              className="text-primary text-sm font-medium hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </PageContainer>
      }
      mainClassName="py-4 md:py-6"
    >
      <PageContainer>{children}</PageContainer>
    </ViewportPageLayout>
  );
}
