import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically import the client component WITHOUT SSR
const StyleClient = dynamic(() => import('./StyleClient'), { ssr: false });

export default function StylePage() {
  return (
    <div className="mobile-display">
      <Suspense fallback={<div>Loading...</div>}>
        <StyleClient />
      </Suspense>
    </div>
  );
}
