'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const imageUrl = searchParams.get('imageUrl');
  const prompt = searchParams.get('prompt');

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/report?imageUrl=${encodeURIComponent(imageUrl || '')}&prompt=${encodeURIComponent(prompt || '')}`);
    }, 8500); // wait 8.5 seconds

    return () => clearTimeout(timer);
  }, [router, imageUrl, prompt]);

  return (
    <div className="mobile-display">
      <video width="100%" autoPlay muted playsInline>
        <source src="/Analyzing.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
