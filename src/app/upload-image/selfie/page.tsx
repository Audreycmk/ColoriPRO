import { Suspense } from 'react';
import SelfieClient from './SelfieClient';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SelfieClient />
    </Suspense>
  );
}
