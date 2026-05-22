import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import GPSTracker from "@/components/GPSTracker";
import Toast from "@/components/Toast";

export const metadata: Metadata = {
  title: "MotoHub - バイク乗りのコミュニティ",
  description: "バイク乗りのための総合コミュニティ。ツーリングルート共有・スポットクチコミ・愛車自慢",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        {/*
          pt-20 = トップナビ(64px) + 余白(16px)
          pb-28 = ボトムナビ(58px) + セーフエリア余裕(54px) ← iOS Safari対応
          md:pb-0 = デスクトップはボトムナビなし
        */}
        <main className="flex-1 pt-20 pb-28 md:pt-20 md:pb-4">
          {children}
        </main>
        <footer className="hidden md:block border-t border-[#252535] py-6 text-center text-sm text-gray-500">
          <p>© 2025 MotoHub — バイク乗りのコミュニティ</p>
        </footer>
        <GPSTracker />
        <Toast />
      </body>
    </html>
  );
}
