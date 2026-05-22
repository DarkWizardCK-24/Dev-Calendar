import type { Metadata } from 'next';
import { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { ECOSYSTEM } from '@/lib/ecosystem';

export const metadata: Metadata = {
  title: 'DevCalendar — Schedule & Goals',
  description: 'Plan your dev life. Track events, deadlines, and goals.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar />
        <main style={{ paddingTop: '64px', minHeight: '100vh' }}>{children}</main>
        <footer className="relative mt-20 border-t border-[var(--color-border)]">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-neon-pink)] to-[var(--color-neon-cyan)] opacity-40" />
          <div className="container-app py-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="text-xs text-[var(--color-text-dim)]">
                <span className="text-[var(--color-neon-green)]">$</span>{' '}
                <span className="text-[var(--color-neon-pink)]">dev</span>
                <span className="text-[var(--color-neon-cyan)]">calendar</span>
                <span className="text-[var(--color-text-dim)]">.sh</span>
                <span className="ml-2 text-[var(--color-text-dim)]">— part of the deveco ecosystem</span>
              </div>
              <span className="text-[10px] text-[var(--color-text-dim)] font-medium tracking-widest uppercase">deveco</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {ECOSYSTEM.map(app => (
                <a
                  key={app.name}
                  href={app.url}
                  className="text-[11px] text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)] transition-colors"
                  style={{ '--hover-color': app.color } as React.CSSProperties}
                >
                  {app.name.toLowerCase()}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
