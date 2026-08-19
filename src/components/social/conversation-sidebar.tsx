"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StartDmDialog } from "@/components/social/start-dm-dialog";

export type ConversationSummary = {
  id: string;
  type: "DIRECT" | "GROUP";
  group: { id: string; name: string; imageUrl: string | null } | null;
  participants: { userId: string; user: { id: string; firstName: string; lastName: string | null; imageUrl: string | null } }[];
  messages: { content: string }[];
  unreadCount: number;
};

export function ConversationSidebar({ conversations, currentUserId }: { conversations: ConversationSummary[]; currentUserId: string }) {
  const pathname = usePathname();
  const [dmDialogOpen, setDmDialogOpen] = useState(false);

  return (
    <div className="flex h-full w-full max-w-xs flex-col border-r border-border">
      <div className="flex items-center justify-between gap-2 border-b border-border p-3">
        <p className="font-semibold">Conversas</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/social/groups">Grupos</Link>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <Button variant="outline" className="mb-2 w-full" onClick={() => setDmDialogOpen(true)}>
          Nova conversa
        </Button>
        <div className="space-y-1">
          {conversations.map((conversation) => {
            const other = conversation.participants.find((participant) => participant.userId !== currentUserId)?.user;
            const name = conversation.type === "GROUP" ? (conversation.group?.name ?? "Grupo") : `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim();
            const imageUrl = conversation.type === "GROUP" ? conversation.group?.imageUrl : other?.imageUrl;
            const href = `/social/c/${conversation.id}`;
            const isActive = pathname === href;
            return (
              <Link
                key={conversation.id}
                href={href}
                className={`flex items-center gap-3 rounded-md p-2 text-sm hover:bg-muted ${isActive ? "bg-muted" : ""}`}
              >
                <Avatar className="size-9">
                  <AvatarImage src={imageUrl ?? undefined} />
                  <AvatarFallback>{name[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{name || "Conversa"}</p>
                  <p className="truncate text-xs text-muted-foreground">{conversation.messages[0]?.content ?? "Sem mensagens ainda"}</p>
                </div>
                {conversation.unreadCount > 0 && <Badge>{conversation.unreadCount}</Badge>}
              </Link>
            );
          })}
          {conversations.length === 0 && <p className="p-2 text-sm text-muted-foreground">Nenhuma conversa ainda. Entre em um grupo ou inicie uma DM.</p>}
        </div>
      </div>
      <StartDmDialog open={dmDialogOpen} onOpenChange={setDmDialogOpen} />
    </div>
  );
}
