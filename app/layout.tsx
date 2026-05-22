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
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" style={{ height: "100%" }}>
      <body style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#0a0a0f",
        color: "#f0f0f8",
      }}>
        <Navbar />
        {/*
          インラインスタイルで確実に余白を確保
          paddingTop: 80px = トップナビ64px + 余白16px
          paddingBottom: 120px = ボトムナビ58px + セーフエリア62px (iOS Safari対応)
        */}
        <main style={{
          flex: 1,
          paddingTop: "80px",
          paddingBottom: "120px",
        }}>
          {children}
        </main>
        {/* フッターはデスクトップのみ */}
        <footer style={{
          borderTop: "1px solid #252535",
          padding: "24px",
          textAlign: "center",
          fontSize: "13px",
          color: "#6b7280",
          display: "none",
        }}
          className="md:block"
        >
          <p>© 2025 MotoHub — バイク乗りのコミュニティ</p>
        </footer>
        <GPSTracker />
        <Toast />
      </body>
    </html>
  );
}
