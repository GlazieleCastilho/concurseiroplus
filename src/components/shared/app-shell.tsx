"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { SearchInput } from "@/components/shared/Search-input";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { PomodoroFloating } from "@/components/pomodoro/pomodoro-floating";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useUser();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-[70px] shrink-0 items-center justify-between gap-2 border-b bg-background/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-1 items-center gap-4">
            <SidebarTrigger className="-ml-1 flex md:hidden" />
            <SearchInput />
          </div>
          {!user ? (
            <Link href="/auth/sign-in">
              <Button size="sm"><LogIn className="h-4 w-4" /> Entrar</Button>
            </Link>
          ) : (
            <Link href="/billing">
              <Button size="sm" variant="outline">Plano e cobranca</Button>
            </Link>
          )}
        </header>
        <div className="flex flex-1 flex-col gap-6 overflow-auto p-4 sm:p-6">{children}</div>
      </SidebarInset>
      {user && <PomodoroFloating />}
    </SidebarProvider>
  );
}
