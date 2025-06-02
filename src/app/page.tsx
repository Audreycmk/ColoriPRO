'use client';

import Link from 'next/link';
import TransitionWrapper from '@/components/TransitionWrapper';
import '@/styles/style.css';

export default function HomePage() {
  return (
    <TransitionWrapper>
      <div className="mobile-display">
        {/* Background Video */}
        <video className="bg-video" autoPlay loop muted playsInline>
          <source src="/home.mp4" type="video/mp4" />
        </video>

        {/* Login Button */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            zIndex: 10,
          }}
        >
          <Link href="/login">
            <button className="login">LOGIN</button>
          </Link>
        </div>

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
