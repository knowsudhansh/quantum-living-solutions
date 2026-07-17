'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Solutions', href: '/solutions' },
    { name: 'Products', href: '/products' },
    { name: 'Experience', href: '/experience' },
    { name: 'Projects', href: '/projects' },
    { name: 'About', href: '/about' },
    { name: 'Book Demo', href: '/book-demo' },
    { name: 'Contact', href: '/contact' },
    { name: 'Careers', href: '/careers' },
  ];

  // Handle body scroll locking
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileMenuOpen]);

  // Handle keyboard events (ESC to close, TAB focus trapping)
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (e.key === 'Tab') {
        if (!menuRef.current) return;
        const focusableElements = menuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (!firstElement || !lastElement) return;

        if (e.shiftKey) {
          // Shift + Tab: loop back to last element
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          // Tab: loop back to first element
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = () => {
    const nextState = !isMobileMenuOpen;
    setIsMobileMenuOpen(nextState);
    if (nextState) {
      // Focus first link in menu when opened after render frame
      setTimeout(() => {
        const firstLink = menuRef.current?.querySelector('a');
        firstLink?.focus();
      }, 50);
    } else {
      triggerRef.current?.focus();
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[HSL(220,15%,12%)] bg-[HSL(8,10%,4%)]/82 backdrop-blur-xl px-4 sm:px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)] outline-none"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/qls-logo.jpg"
            alt="Quantum Living Solutions Logo"
            className="w-8 h-8 shrink-0 rounded-md object-cover border border-zinc-800"
          />
          <span className="truncate font-sans text-base sm:text-lg font-light tracking-wide text-[HSL(40,30%,95%)]">
            Quantum Living Solutions
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-5 xl:gap-7">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : link.href === '/products'
                ? pathname.startsWith('/products')
                : pathname === link.href;
            const isBookDemo = link.name === 'Book Demo';
            if (isBookDemo) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="qls-button qls-button-primary min-h-0 px-4 py-2 text-[10px]"
                >
                  {link.name}
                </Link>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-sm px-1 py-1 text-sm tracking-wide transition-colors duration-200 ${
                  isActive
                    ? 'text-[HSL(40,30%,95%)]'
                    : 'text-[HSL(210,15%,75%)] hover:text-[HSL(40,30%,95%)]'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-[HSL(35,30%,50%)]"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Menu Toggle Button */}
        <button
          ref={triggerRef}
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
          className="lg:hidden rounded-md p-2 text-[HSL(210,15%,85%)]"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Navigation Menu Drawer */}
      <AnimatePresence>
      {isMobileMenuOpen && (
        <motion.div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-x-0 top-[var(--qls-header-height)] z-40 h-[var(--qls-available-height)] w-full overflow-y-auto bg-[HSL(8,10%,4%)]/98 px-6 py-10 flex flex-col lg:hidden"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-5">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : link.href === '/products'
                  ? pathname.startsWith('/products')
                  : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-md py-3 text-xl font-light tracking-wide ${
                    isActive ? 'text-[HSL(40,30%,95%)] border-l-2 border-[HSL(35,30%,45%)] pl-4' : 'text-[HSL(210,15%,75%)]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </motion.div>
      )}
      </AnimatePresence>
    </header>
  );
}
