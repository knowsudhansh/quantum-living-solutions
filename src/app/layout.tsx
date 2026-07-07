import type { Metadata } from "next";
import "./globals.css";

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
        <header className="w-full py-4 px-6 border-b border-zinc-200 dark:border-zinc-800">
          <nav aria-label="Main Navigation">
            <span className="font-bold text-lg">Quantum Living Solutions</span>
          </nav>
        </header>
        <main id="main-content" className="flex-grow flex flex-col justify-center items-center px-6">
          {children}
        </main>
        <footer className="w-full py-4 px-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-sm text-zinc-600 dark:text-zinc-400">
          <span>&copy; {new Date().getFullYear()} Quantum Living Solutions. All rights reserved.</span>
        </footer>
      </body>
    </html>
  );
}
export const dynamic = "force-static";
