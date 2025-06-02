import { Suspense } from 'react';
import SelfiePageClient from './SelfiePageClient';

export default function SelfiePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelfiePageClient />
    </Suspense>
  );
}
