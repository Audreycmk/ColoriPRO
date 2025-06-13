'use client';

import { useAuth, UserButton } from '@clerk/nextjs';
import Link from 'next/link';

export default function Navigation() {
  const { isLoaded, isSignedIn } = useAuth();

  return (
    <div
      style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 10,
      }}
    >
      {isLoaded && (
        isSignedIn ? (
          <div className="w-15 h-15 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center cursor-pointer hover:bg-white/30 transition-all" style={{ marginTop: '10px' }}>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonAvatarImage: "w-8 h-8"
                }
              }}
            />
          </div>
        ) : (
          <Link href="/login">
            <button className="login">LOGIN</button>
          </Link>
        )
      )}
    </div>
  );
} 