import React from 'react';
import Link from 'next/link';
import NewsletterFooterForm from './newsletter-footer-form';
import { PartnerCollaborations } from '../partners/partner-collaborations';


export default function Footer() {
  return (
    <footer className="w-full border-t border-[HSL(220,15%,12%)] bg-[HSL(8,10%,4%)] mt-auto text-[HSL(210,15%,75%)] relative z-10">
      {/* Premium Conversion Section */}
      <div className="max-w-7xl mx-auto px-6 py-16 border-b border-[HSL(220,15%,12%)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <span className="text-xs font-mono uppercase tracking-widest text-[HSL(35,30%,45%)] mb-2 block select-none">
              CONSULTING & SHOWROOM
            </span>
            <h2 className="qls-section-title mb-4">
              Bring Comfort & Intelligence Into Your Space
            </h2>
            <p className="text-base text-foreground/75 leading-relaxed max-w-xl">
              Connect directly with our founder, Raj Kumar Sharma, to plan custom scenes, high-end lighting, and intelligent climate control for your home.
            </p>
          </div>
          <div className="lg:col-span-5 flex flex-col sm:flex-row gap-4 justify-end">
            <a
              href="https://wa.me/918130856575"
              target="_blank"
              rel="noopener noreferrer"
              className="qls-button qls-button-primary"
            >
              Consult on WhatsApp
            </a>
            <Link
              href="/book-demo"
              className="qls-button qls-button-secondary"
            >
              Book Free Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row items-start justify-between gap-12">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-3 text-lg font-light tracking-wide text-[HSL(40,30%,95%)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/qls-logo.jpg"
              alt="Quantum Living Solutions Logo"
              className="w-8 h-8 rounded-sm object-cover border border-zinc-850"
            />
            <span className="font-sans text-lg font-light tracking-wide text-[HSL(40,30%,95%)]">
              Quantum Living Solutions
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[HSL(210,15%,65%)]">
            Premium home and commercial automation services. We engineer comfort, cinema, automated shades, and lighting presets customized to your lifestyle.
          </p>
          <div className="text-xs font-mono space-y-1 text-zinc-500 pt-2">
            <p>Shravan Nagar, Swarn City Road</p>
            <p>Singhariya, Kunraghat, Gorakhpur</p>
            <p>Uttar Pradesh 273008, India</p>
            <p className="pt-2">Mon – Fri: 09:00 am – 05:00 pm</p>
            <p>Sat & Sun: Closed</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-x-16 gap-y-8">
          <div>
            <h2 className="text-sm font-semibold tracking-wider text-[HSL(40,30%,95%)] uppercase mb-4">
              Quick Links
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
                  href="/products"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  Products
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
              Connect
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="tel:+918130856575"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  +91 8130856575
                </a>
              </li>
              <li>
                <a
                  href="mailto:rajkumarsharma@quantumlivingsolutions.com"
                  className="hover:text-[HSL(40,30%,95%)] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[HSL(210,80%,60%)]"
                >
                  rajkumarsharma@quantumlivingsolutions.com
                </a>
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

          {/* Newsletter subscription column */}
          <div className="max-w-xs space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-[HSL(40,30%,95%)] uppercase">
              Newsletter
            </h2>
            <p className="text-xs leading-relaxed text-zinc-500 font-mono uppercase">
              Subscribe to stay updated with showroom slots and design ideas.
            </p>
            <NewsletterFooterForm />
          </div>
        </div>
      </div>

      {/* Partner collaborations compact strip */}
      <div className="max-w-7xl mx-auto px-6 border-t border-[HSL(220,15%,12%)] py-8">
        <PartnerCollaborations placement="footer" variant="compact" />
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-[HSL(220,15%,12%)] py-8 flex flex-col md:flex-row items-center justify-between text-xs text-[HSL(210,15%,55%)]">
        <p>&copy; {new Date().getFullYear()} Quantum Living Solutions. All rights reserved.</p>
        <p className="mt-2 md:mt-0">Premium Smart Home & Automation Systems.</p>
      </div>
    </footer>
  );
}
