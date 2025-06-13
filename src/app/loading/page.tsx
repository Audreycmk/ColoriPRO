'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/report';
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleVideoEnd = () => {
      // If video ends before 8.5s, restart it
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.play();
      }
    };

    const startTimer = () => {
      timer = setTimeout(() => {
        // After 8.5s, redirect to report page
        router.push(returnTo);
      }, 8500);
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('ended', handleVideoEnd);
      startTimer();
    }

    return () => {
      clearTimeout(timer);
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', handleVideoEnd);
      }
    };
  }, [router, returnTo]);

  return (
    <div className="mobile-display">
      <video 
        ref={videoRef}
        width="100%" 
        autoPlay 
        muted 
        playsInline
      >
        <source src="/Analyzing.mp4" type="video/mp4" />
      </video>
    </div>
  );
}
