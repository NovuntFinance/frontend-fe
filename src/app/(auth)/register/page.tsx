import { redirect } from 'next/navigation';
import { buildSignupRedirectUrl } from '@/utils/referralUrl';

/**
 * Register Route Redirect
 * Redirects /register to /signup for consistency.
 * Preserves query params (e.g. ?ref=CODE) so referral links work.
 * Kept for backward compatibility with old bookmarks/links
 */
export default async function RegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  redirect(buildSignupRedirectUrl(params));
}
