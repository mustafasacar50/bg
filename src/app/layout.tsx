import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bulgarca Sınav Modülü",
  description: "Bulgarca öğrenimi için interaktif sınav modülü",
};

export const viewport = {
  themeColor: "#5b4bdb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={inter.className}>
        <main className="app-container">
          {children}
        </main>
      </body>
    </html>
  );
}
