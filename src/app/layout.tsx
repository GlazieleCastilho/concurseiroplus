import type { Metadata } from "next";
import { Inter } from "next/font/google";
import {cn} from "@/lib/utils";
import {ClerkProvider} from "@clerk/nextjs";
import {ptBR} from "@clerk/localizations";

import "@/styles/globals.css";
import "@/styles/clerk.css";

const inter = Inter({
  variable: "--font-inter-sans-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Concurseiro+",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables:{
          colorPrimary: "hsl(160 100% 37%)",
        }
      }}
      localization={ptBR}>
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(inter.variable, "antialiased font-sans-serif dark")}
      >
        {children}
      </body>
    </html>
    </ClerkProvider>
  );
}
