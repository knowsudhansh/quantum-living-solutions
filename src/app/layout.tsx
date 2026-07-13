import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/navigation/header";
import Footer from "../components/navigation/footer";
import { ScrollReveal } from "../components/utils/scroll-reveal";

export const metadata: Metadata = {
  title: "Quantum Living Solutions",
  description: "Luxury Home & Commercial Automation Systems Showroom Experience",
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
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
