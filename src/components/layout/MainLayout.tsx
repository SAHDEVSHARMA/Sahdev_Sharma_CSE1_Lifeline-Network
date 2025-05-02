"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from 'src/components/ui/sidebar';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Skip layout for authentication pages
  if (
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/register' ||
    pathname.includes('/hospital/login') ||
    pathname.includes('/hospital/register') ||
    pathname.includes('/driver/login') ||
    pathname.includes('/driver/register')
  ) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen bg-background">
          {children}
          <Toaster />
        </div>
      </ThemeProvider>
    );
  }
  
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10">
          {children}
        </main>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
