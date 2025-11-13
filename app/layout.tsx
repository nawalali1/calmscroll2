import type { Metadata } from 'next';
import './globals.css';
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
      </head>
      <body>
        <AuthProvider>
          <div className="mobile-container safe-area-top">
            <main className="flex-1 flex flex-col overflow-y-auto">{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}