import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Points Radar — Find the Best Award Flight Deals",
  description: "Discover high-value points redemptions and maximize your credit card rewards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
              Points Radar
            </a>
            <div className="flex items-center gap-5">
              <a href="/search" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Deal Search
              </a>
              <a href="/destinations" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                Where Can I Go?
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-gray-200 mt-12">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-xs text-gray-400">
            Points Radar &mdash; Find more value in every point.
          </div>
        </footer>
      </body>
    </html>
  );
}
