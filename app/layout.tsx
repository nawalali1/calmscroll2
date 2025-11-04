import type { Metadata } from 'next';
import './globals.css';
import { ConditionalBottomNav } from '@/components/ConditionalBottomNav';
import { AuthProvider } from './providers';

export const metadata: Metadata = {
  title: 'CalmScroll',
  description: 'Break the doom scroll. Reset, plan, and refocus.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <script dangerouslySetInnerHTML={{__html: `
          if (typeof window !== 'undefined') {
            const isDev = process.env.NODE_ENV === 'development';
            if (!sessionStorage.getItem('devCleared')) {
              localStorage.clear();
              sessionStorage.setItem('devCleared', 'true');
            }
          }
        `}} />
      </head>
      <body>
        <AuthProvider>
          <div className="mobile-container safe-area-top">
            <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
            <ConditionalBottomNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
