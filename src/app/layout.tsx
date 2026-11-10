import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SosAssistant } from "@/components/SosAssistant";
import { PwaInstaller } from "@/components/PwaInstaller";

export const metadata: Metadata = {
  title: "AviFlow — Gestion avicole quotidienne",
  description: "Gestion, traçabilité et suivi sanitaire des fermes avicoles",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  applicationName: "AviFlow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e7a4b",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <div className="app-shell">
          <Providers>
            {children}
            <SosAssistant />
            <PwaInstaller />
          </Providers>
        </div>
      </body>
    </html>
  );
}
