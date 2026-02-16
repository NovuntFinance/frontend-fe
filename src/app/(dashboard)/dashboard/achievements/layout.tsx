/**
 * Achievements layout - force dynamic rendering
 * Prevents SSG prerender where auth/user state is unavailable
 */
export const dynamic = 'force-dynamic';

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
