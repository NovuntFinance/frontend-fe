'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DistributionSchedulePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/daily-declaration-returns?tab=schedule');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <p className="text-muted-foreground text-sm">
        Redirecting to Daily Declaration Returns...
      </p>
    </div>
  );
}
