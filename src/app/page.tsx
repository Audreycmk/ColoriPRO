'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import Link from 'next/link';
import TransitionWrapper from '@/components/TransitionWrapper';
import Navigation from '@/components/Navigation';
import '@/styles/style.css';

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      if (isSignedIn) {
        try {
          // Check if user is admin
          const response = await fetch('/api/check-admin');
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (err) {
          console.error('Error checking admin status:', err);
        }
      }
    };

    checkAuth();
  }, [isLoaded, isSignedIn]);

  return (
    <TransitionWrapper>
      <div className="mobile-display">
        {/* Background Video */}
        <video className="bg-video" autoPlay loop muted playsInline>
          <source src="/home.mp4" type="video/mp4" />
        </video>

        {/* Navigation */}
        <Navigation />
        {/* Find My Color Button */}
        <div className="container">
          <Link href="/age">
            <button className="find-my-color">Find My Color</button>
          </Link>
        </div>
      </div>
    </TransitionWrapper>
  );
}
