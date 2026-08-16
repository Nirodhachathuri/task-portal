'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import './login.css';

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      nextErrors.email = 'Email address is required.';
    } else if (!validateEmail(normalizedEmail)) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      nextErrors.password = 'Password is required.';
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          form: data.error ?? 'Unable to log in.',
        });
        return;
      }

      router.push('/tasks');
      router.refresh();
    } catch {
      setErrors({
        form: 'Unable to connect to the server. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">

        <div className="login-header">
          

          <h1 className="login-title">
            Welcome back
          </h1>

          <p className="login-subtitle">
            Sign in to manage your tasks.
          </p>
        </div>

        {errors.form && (
          <div className="login-form-error">
            {errors.form}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          noValidate
          className="login-form"
        >
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="login-label"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (!email.trim()) {
                  setErrors((e) => ({
                    ...e,
                    email: 'Email address is required.',
                  }));
                } else if (!validateEmail(email.trim())) {
                  setErrors((e) => ({
                    ...e,
                    email: 'Enter a valid email address.',
                  }));
                } else {
                  setErrors((e) => ({
                    ...e,
                    email: undefined,
                  }));
                }
              }}
              className={`login-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
            />

            {errors.email && (
              <p className="login-error">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="login-label"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                if (!password) {
                  setErrors((e) => ({
                    ...e,
                    password: 'Password is required.',
                  }));
                }
              }}
              className={`login-input ${
                errors.password ? 'error' : ''
              }`}
              placeholder="Enter your password"
            />

            {errors.password && (
              <p className="login-error">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="login-button"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="login-footer">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="login-link"
          >
            Create one
          </Link>
        </p>

      </section>
    </main>
  );
}