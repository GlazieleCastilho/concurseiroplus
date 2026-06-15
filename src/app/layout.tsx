import type { Metadata, Viewport } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ptBR } from "@clerk/localizations";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/components/shared/app-providers";

import "@/styles/globals.css";
import "@/styles/clerk.css";

const sora = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Concurseiro+ | Plataforma premium para concursos publicos",
    template: "%s | Concurseiro+",
  },
  description: "Simulados reais, correcao de redacoes por IA, Skills especialistas, planner, ranking e estatisticas para concursos publicos brasileiros.",
  openGraph: {
    title: "Concurseiro+",
    description: "A plataforma premium para quem leva concurso publico a serio.",
    type: "website",
    locale: "pt_BR",
    siteName: "Concurseiro+",
  },
  twitter: {
    card: "summary_large_image",
    title: "Concurseiro+",
    description: "Simulados, redacao por IA, Skills especialistas e planner de estudos.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D1117",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      localization={ptBR}
      appearance={{
        variables: {
          colorPrimary: "#2E5F9A",
          colorBackground: "#0D1117",
          colorText: "#E6EDF3",
          borderRadius: "0.5rem",
        },
      }}
    >
      <html lang="pt-BR" className="dark" suppressHydrationWarning>
        <body className={cn(sora.variable, dmSans.variable, "min-h-screen bg-background font-sans antialiased")}>
          <AppProviders>{children}</AppProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
