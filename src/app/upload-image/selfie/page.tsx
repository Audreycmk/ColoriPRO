import { Suspense } from 'react';
import SelfiePageClient from './SelfiePageClient';
import TransitionWrapper from '@/components/TransitionWrapper';

export default function SelfiePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TransitionWrapper>
        <SelfiePageClient />
      </TransitionWrapper>
    </Suspense>
  );
}
