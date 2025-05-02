import './globals.css';
import type { Metadata } from 'next';
import { MainLayout } from 'src/components/layout/MainLayout';

export const metadata: Metadata = {
  title: 'Life-line Network',
  description: 'Emergency Medical Services Network',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <MainLayout>{children}</MainLayout>
      </body>
    </html>
  );
}
