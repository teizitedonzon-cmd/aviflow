import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { SosAssistant } from "@/components/SosAssistant";

export const metadata: Metadata = {
  title: "AviFlow — Gestion avicole quotidienne",
  description: "Gestion, traçabilité et suivi sanitaire des fermes avicoles",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2f6d3c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>
          {children}
          <SosAssistant />
        </Providers>
      </body>
    </html>
  );
}
