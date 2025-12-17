'use client';

import React from 'react';
import { PoolDeclarationManager } from '@/components/admin/pool/PoolDeclarationManager';

export default function PoolDeclarationPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Pool Declaration</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Declare and distribute Performance Pool and Premium Pool amounts
        </p>
      </div>

      <PoolDeclarationManager />
    </div>
  );
}
