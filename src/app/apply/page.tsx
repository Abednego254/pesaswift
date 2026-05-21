'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplyPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/');
  }, [router]);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>Redirecting to Unified Workspace...</div>;
}
