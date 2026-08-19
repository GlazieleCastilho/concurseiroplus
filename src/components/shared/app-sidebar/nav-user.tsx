"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { useClerk, useUser } from "@clerk/nextjs";
import { BadgeCheck, ChevronsUpDown, LogIn, LogOut } from "lucide-react";
import Link from "next/link";

export const NavUser = () => {
  const { user, isLoaded } = useUser();

  // define isMobile
  const { isMobile } = useSidebar();

  // pega ações do Clerk
  const { openUserProfile, signOut } = useClerk();

  // O Clerk pode resolver a sessao de forma sincrona no cliente (cache local), entao
  // "user"/"isLoaded" ja vem populado na primeira renderizacao do cliente - mas o
  // servidor sempre renderiza sem sessao (Skeleton). Sem esse guard, cliente e servidor
  // montam arvores de DOM diferentes (Skeleton vs menu vs botao de login) e quebra a
  // hidratacao. So usa o valor real depois que montou, pra bater com o SSR primeiro.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {mounted && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar imageUrl={user.imageUrl} fallback={user.fullName ?? user.firstName ?? "U"} />

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span>{user.fullName}</span>
                  <span className="truncate text-xs">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar imageUrl={user.imageUrl} fallback={user.fullName ?? user.firstName ?? "U"} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.fullName}</span>
                    <span className="truncate text-xs">
                      {user.primaryEmailAddress?.emailAddress}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => openUserProfile()}>
                  <BadgeCheck className="mr-2 size-4" />
                  Gerenciar conta
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => signOut()}>
                  <LogOut className="mr-2 size-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            {!mounted || !isLoaded ? (
              <Skeleton className="h-9 w-full" />
            ) : (
              <div className="p-2">
                <Link href="/auth/sign-in" className="w-full">
                  <Button size="sm" variant="outline" className="w-full">
                    <LogIn className="mr-2 size-4" />
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

function UserAvatar({ imageUrl, fallback }: { imageUrl: string; fallback: string }) {
  return (
    <Avatar>
      <AvatarImage src={imageUrl} alt={fallback} />
      <AvatarFallback>{fallback.slice(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );
}
