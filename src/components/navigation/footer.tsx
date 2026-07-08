import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full border-t border-[HSL(220,15%,12%)] bg-[HSL(220,25%,7%)] px-6 py-12 mt-auto text-[HSL(210,15%,75%)]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start justify-between gap-8">
        <div className="space-y-4">
          <span className="text-lg font-normal tracking-wider text-[HSL(40,30%,95%)]">
            QUANTUM
          </span>
          <p className="text-sm max-w-xs leading-relaxed text-[HSL(210,15%,65%)]">
            Luxury home automation systems designed for high performance, usability, and accessibility.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-[HSL(40,30%,95%)] uppercase mb-4">
              Sitemap
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/solutions"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Solutions
                </Link>
              </li>
              <li>
                <Link
                  href="/experience"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Experience
                </Link>
              </li>
              <li>
                <Link
                  href="/projects"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Projects
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wider text-[HSL(40,30%,95%)] uppercase mb-4">
              Resources
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/book-demo"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Book Demo
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold tracking-wider text-[HSL(40,30%,95%)] uppercase mb-4">
              Legal
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/privacy-policy"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/terms-of-service"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/refund-policy"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/payment-disclaimer"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Payment Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-[HSL(220,15%,12%)] pt-8 mt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[HSL(210,15%,55%)]">
        <p>&copy; {new Date().getFullYear()} Quantum Living Solutions. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Natural Architectural Illumination.</p>
      </div>
    </footer>
  );
}
