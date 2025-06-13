'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserResource } from '@clerk/types';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';

export default function UserProfileById() {
  const { id } = useParams();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const [user, setUser] = useState<UserResource | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoaded) return;

      if (!isSignedIn) {
        router.push('/login');
        return;
      }

      try {
        // Check if user is admin
        const response = await fetch('/api/check-admin');
        const data = await response.json();

        if (!data.isAdmin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);
        // Fetch user data
        const userResponse = await fetch(`/api/admin/user/${id}`);
        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }
        const userData = await userResponse.json();
        setUser(userData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isLoaded, isSignedIn, router, id]);

  if (loading) {
    router.push('/loading');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin">
            <button className="px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
              Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5DC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F5DC]">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="mt-1 text-sm text-gray-500">
                Viewing profile for {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">
                  Back to Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start space-x-6">
            <div className="relative w-32 h-32">
              <Image
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">Name:</span> {user.firstName} {user.lastName}</p>
                    <p><span className="font-medium">Username:</span> @{user.username}</p>
                    <p><span className="font-medium">Email:</span> {user.emailAddresses[0]?.emailAddress}</p>
                    <p><span className="font-medium">User ID:</span> {user.id}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account Details</h3>
                  <div className="space-y-3">
                    <p><span className="font-medium">Created:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium">Last Sign In:</span> {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Never'}</p>
                    <p><span className="font-medium">Status:</span> {user.publicMetadata?.role === 'admin' ? 'Admin' : 'User'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 