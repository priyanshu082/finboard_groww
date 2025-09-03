
'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-bold mb-2">Page not found</h1>
      <p className="text-gray-500 mb-6">The page you’re looking for doesn’t exist.</p>
      <Link
        href="/"
        className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
      >
        Go to Homepage
      </Link>
    </div>
  );
}