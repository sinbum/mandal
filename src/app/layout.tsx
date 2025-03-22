import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '만다라트 플래너',
  description: '목표를 체계적으로 관리하는 만다라트 기법 플래너',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <div className="max-w-md mx-auto min-h-screen bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
