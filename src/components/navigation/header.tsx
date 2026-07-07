'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    { name: 'Solutions', href: '/solutions' },
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
    <header className="sticky top-0 z-50 w-full border-b border-[HSL(220,15%,12%)] bg-[HSL(220,25%,7%)]/80 backdrop-blur-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo link */}
        <Link
          href="/"
          className="text-lg font-normal tracking-wider text-[HSL(40,30%,95%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
        >
          QUANTUM
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)] px-1 py-1 ${
                  isActive
                    ? 'text-[HSL(40,30%,95%)] border-b border-[HSL(35,30%,45%)]'
                    : 'text-[HSL(210,15%,75%)] hover:text-[HSL(40,30%,95%)]'
                }`}
              >
                {link.name}
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
          className="md:hidden p-2 text-[HSL(210,15%,85%)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
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
      {isMobileMenuOpen && (
        <div
          ref={menuRef}
          id="mobile-menu"
          className="fixed inset-0 top-[65px] z-40 w-full h-[calc(100vh-65px)] bg-[HSL(220,25%,7%)] px-6 py-12 flex flex-col md:hidden"
        >
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xl font-light tracking-wide focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)] py-2 ${
                    isActive ? 'text-[HSL(40,30%,95%)] border-l-2 border-[HSL(35,30%,45%)] pl-4' : 'text-[HSL(210,15%,75%)]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
