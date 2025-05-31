import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Dynamically load the client component
const StyleClient = dynamic(() => import('./StyleClient'), { ssr: false });

export default function StylePage() {
  return (
    <div className="mobile-display">
      <Suspense fallback={<div>Loading style page...</div>}>
        <StyleClient />
      </Suspense>
    </div>
  );
}
