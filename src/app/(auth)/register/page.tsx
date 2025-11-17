import { redirect } from 'next/navigation';

/**
 * Register Route Redirect
 * Redirects /register to /signup for consistency
 * Kept for backward compatibility with old bookmarks/links
 */
export default function RegisterRedirect() {
	redirect('/signup');
}
