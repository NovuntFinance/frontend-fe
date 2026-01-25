'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DailyProfitRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/daily-declaration-returns');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Redirecting...</p>
    </div>
  );
}
