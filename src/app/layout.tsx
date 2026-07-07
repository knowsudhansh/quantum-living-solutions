import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/navigation/header";
import Footer from "../components/navigation/footer";

export const metadata: Metadata = {
  title: "Quantum Living Solutions",
  description: "Luxury Home & Commercial Automation Systems Showroom Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-current">
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="flex-grow w-full flex flex-col justify-start">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

export const dynamic = "force-dynamic";
