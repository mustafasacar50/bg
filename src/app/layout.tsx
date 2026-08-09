import type { Metadata } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const caveat = Caveat({ subsets: ["cyrillic", "latin"], variable: "--font-cursive" });

export const metadata: Metadata = {
  title: "Bulgarca Sınav Modülü",
  description: "Bulgarca öğrenimi için interaktif sınav modülü",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bulgarca",
  },
};

export const viewport = {
  themeColor: "#5b4bdb",
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
    <html lang="tr">
      <body className={`${inter.className} ${caveat.variable}`}>
        <main className="app-container">
          {children}
        </main>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    reg.update(); // Force update SW
                  });
                  
                  // Clear old next-pwa caches to prevent Safari offline issues
                  if (window.caches) {
                    caches.keys().then(function(names) {
                      for (let name of names) {
                        caches.delete(name);
                      }
                    });
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
