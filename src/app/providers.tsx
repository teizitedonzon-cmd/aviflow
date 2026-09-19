"use client";

import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import { AppInit } from "@/components/AppInit";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppInit />
      {children}
    </SessionProvider>
  );
}
