import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/navigation/header";
import Footer from "../components/navigation/footer";
import { ScrollReveal } from "../components/utils/scroll-reveal";
import { MotionProvider, SmoothScroll } from "../components/animation";

const siteUrl = process.env.NEXTAUTH_URL || "https://quantumlivingsolutions.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quantum Living Solutions",
    template: "%s | Quantum Living Solutions",
  },
  description: "Luxury home and commercial automation systems, designed around the way you live and work.",
  applicationName: "Quantum Living Solutions",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Quantum Living Solutions",
    title: "Quantum Living Solutions",
    description: "Luxury home and commercial automation systems, designed around the way you live and work.",
    images: [{
      url: "/brand/qls-logo.jpg",
      width: 512,
      height: 512,
      alt: "Quantum Living Solutions",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quantum Living Solutions",
    description: "Luxury home and commercial automation systems, designed around the way you live and work.",
    images: ["/brand/qls-logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/brand/qls-logo.jpg",
    shortcut: "/brand/qls-logo.jpg",
    apple: "/brand/qls-logo.jpg",
  },
};

import { ToastProvider } from "../components/utils/toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Quantum Living Solutions",
    url: siteUrl,
    logo: `${siteUrl}/brand/qls-logo.jpg`,
  };

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <MotionProvider>
          <SmoothScroll />
          <ToastProvider>
            <ScrollReveal />
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current">
              Skip to content
            </a>
            <Header />
            <main id="main-content" className="flex-grow w-full flex flex-col justify-start">
              {children}
            </main>
            <Footer />
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
