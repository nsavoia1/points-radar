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
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-6">
            <a href="/" className="text-xl font-bold text-indigo-600">
              Points Radar
            </a>
            <a href="/search" className="text-sm text-gray-600 hover:text-gray-900">
              Deal Search
            </a>
            <a href="/destinations" className="text-sm text-gray-600 hover:text-gray-900">
              Where Can I Go?
            </a>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
