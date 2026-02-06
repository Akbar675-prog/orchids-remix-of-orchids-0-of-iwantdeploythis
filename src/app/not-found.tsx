"use client";

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[#f8fafc]">
      <div className="text-center p-8">
        <h1 className="text-6xl font-bold text-[#1e293b] mb-4">404</h1>
        <p className="text-[#64748b] mb-8">Halaman tidak ditemukan</p>
        <Link 
          href="/" 
          className="inline-flex items-center rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
