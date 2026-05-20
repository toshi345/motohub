import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GPSTracker from "@/components/GPSTracker";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "MotoHub - バイク乗りのコミュニティ",
  description: "バイク乗りのための総合コミュニティ。ツーリングルート共有・スポットクチコミ・愛車自慢",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0f]">
        <Navbar />
        <main className="flex-1 pt-16">
          {children}
        </main>
        <footer className="border-t border-[#252535] py-6 text-center text-sm text-gray-500 mt-12 mb-16 md:mb-0">
          <p>© 2025 MotoHub — バイク乗りのコミュニティ</p>
        </footer>
        {/* GPS floating tracker — always visible */}
        <GPSTracker />
        <Toast />
      </body>
    </html>
  );
}
