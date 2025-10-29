import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'CalmScroll',
  description: 'Break the doom scroll. Reset, plan, and refocus.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body>
        <AuthProvider>
          <div className="mobile-container safe-area-top">
            <main className="flex-1 flex flex-col overflow-y-auto">
              {children}
            </main>
            <BottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
