'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  RiCalendarLine,
  RiMenu3Line,
  RiCloseLine,
  RiCalendarTodoLine,
  RiListCheck3,
  RiFocus3Line,
  RiArrowLeftSLine,
} from 'react-icons/ri';
import AuthButton from '@/components/auth/AuthButton';

const NAV_LINKS = [
  { href: '/',          label: 'calendar',  icon: RiCalendarLine },
  { href: '/today',     label: 'today',     icon: RiCalendarTodoLine },
  { href: '/schedule',  label: 'schedule',  icon: RiListCheck3 },
  { href: '/goals',     label: 'goals',     icon: RiFocus3Line },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[rgba(5,7,15,0.85)] backdrop-blur-xl">
        {/* top gradient line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-neon-pink)] to-[var(--color-neon-cyan)]" />

        <div className="container-app flex items-center justify-between h-16">

          {/* ── Logo ────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center
              bg-[rgba(255,110,180,0.12)] border border-[rgba(255,110,180,0.25)]
              group-hover:bg-[rgba(255,110,180,0.22)] group-hover:border-[rgba(255,110,180,0.5)]
              group-hover:shadow-[0_0_12px_rgba(255,110,180,0.3)]
              transition-all duration-200">
              <RiCalendarLine className="text-[var(--color-neon-pink)]" size={15} />
            </div>
            <span className="font-bold text-sm tracking-tight leading-none">
              <span className="text-[var(--color-neon-pink)]">dev</span>
              <span className="text-[var(--color-neon-cyan)]">calendar</span>
              <span className="text-[var(--color-text-dim)]">.sh</span>
            </span>
          </Link>

          {/* ── Desktop nav ──────────────────────── */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150
                    ${active
                      ? 'text-[var(--color-neon-pink)] bg-[rgba(255,110,180,0.1)] border border-[rgba(255,110,180,0.25)] shadow-[0_0_8px_rgba(255,110,180,0.15)]'
                      : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-transparent'
                    }`}
                >
                  {active && <span className="text-[var(--color-neon-green)] text-[10px]">$</span>}
                  <Icon size={12} />
                  ~/{label}
                </Link>
              );
            })}

            {/* divider */}
            <div className="w-px h-5 bg-[var(--color-border)] mx-2" />

            {/* DevFolio hub link */}
            <a
              href="http://localhost:3000"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md
                border border-[var(--color-border)] text-[var(--color-text-dim)]
                hover:border-[rgba(0,229,255,0.4)] hover:text-[var(--color-neon-cyan)]
                hover:bg-[rgba(0,229,255,0.06)] hover:shadow-[0_0_8px_rgba(0,229,255,0.1)]
                transition-all duration-150 group"
            >
              <RiArrowLeftSLine size={12} className="group-hover:-translate-x-0.5 transition-transform duration-150" />
              devfolio
            </a>

            <div className="ml-2">
              <AuthButton />
            </div>
          </nav>

          {/* ── Mobile toggle ────────────────────── */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md
              border border-[var(--color-border)] text-[var(--color-text-muted)]
              hover:border-[rgba(255,110,180,0.4)] hover:text-[var(--color-neon-pink)]
              hover:bg-[rgba(255,110,180,0.06)] transition-all duration-150"
            aria-label="Toggle menu"
          >
            {open ? <RiCloseLine size={18} /> : <RiMenu3Line size={18} />}
          </button>
        </div>

        {/* bottom separator */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[var(--color-border)] to-transparent" />
      </header>

      {/* ── Mobile menu ───────────────────────────── */}
      {open && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <nav
            className="absolute top-16 left-0 right-0 bg-[var(--color-surface)] border-b border-[var(--color-border)]"
            onClick={e => e.stopPropagation()}
          >
            <div className="container-app py-3 space-y-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-all
                      ${active
                        ? 'text-[var(--color-neon-pink)] bg-[rgba(255,110,180,0.1)] border border-[rgba(255,110,180,0.2)]'
                        : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-transparent'
                      }`}
                  >
                    {active
                      ? <span className="text-[var(--color-neon-green)] text-xs w-3">$</span>
                      : <span className="w-3" />
                    }
                    <Icon size={14} />
                    ~/{label}
                  </Link>
                );
              })}

              <div className="h-px bg-[var(--color-border)] my-2" />

              <a
                href="http://localhost:3000"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium
                  text-[var(--color-text-dim)] hover:text-[var(--color-neon-cyan)]
                  hover:bg-[rgba(0,229,255,0.06)] border border-transparent
                  hover:border-[rgba(0,229,255,0.2)] transition-all"
              >
                <span className="w-3" />
                <RiArrowLeftSLine size={14} />
                ↩ devfolio hub
              </a>

              <div className="h-px bg-[var(--color-border)] my-2" />

              <div className="px-3 py-2">
                <AuthButton />
              </div>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}