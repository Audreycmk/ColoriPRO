'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TransitionWrapper from '@/components/TransitionWrapper';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } else {
      setError('Invalid login credentials');
    }
  };

  return (
    <TransitionWrapper>
      <div className="login-page" style={{ padding: '2rem', maxWidth: '400px', margin: '0 auto' }}>
        
        {/* Back Button */}
        <button
          type="button"
          onClick={() => router.push('/')}
          style={{ marginBottom: '1rem' }}
        >
          ← Back to Home
        </button>

        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <div>
            <label>Email</label><br />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
          </div>
          <div>
            <label>Password</label><br />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', marginBottom: '1rem' }}
            />
          </div>
          {error && <div className="error" style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}
          <button type="submit" style={{ width: '100%' }}>Login</button>

          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <p>
              <a href="/forgot-password" style={{ color: 'blue' }}>Forgot Password?</a>
            </p>
            <p>
              <a href="/create-account" style={{ color: 'blue' }}>Create an Account</a>
            </p>
          </div>
        </form>
      </div>
    </TransitionWrapper>
  );
}
