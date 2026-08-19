"use client";

import Link from "next/link";
import { MessageCirclePlus } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StartDmDialog } from "@/components/social/start-dm-dialog";
import { GroupsTab } from "@/components/social/groups-tab";
import { formatUserName } from "@/lib/social-format";

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
      <Tabs defaultValue="conversas" className="flex flex-1 flex-col overflow-hidden gap-0">
        <div className="border-b border-border p-3">
          <TabsList className="w-full">
            <TabsTrigger value="conversas" className="flex-1">Conversas</TabsTrigger>
            <TabsTrigger value="grupos" className="flex-1">Grupos</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="conversas" className="flex-1 overflow-y-auto p-2">
          <Button variant="outline" className="mb-2 w-full justify-start gap-2" onClick={() => setDmDialogOpen(true)}>
            <MessageCirclePlus className="size-4" />
            Iniciar mensagem direta
          </Button>
          <div className="space-y-1">
            {conversations.map((conversation) => {
              const other = conversation.participants.find((participant) => participant.userId !== currentUserId)?.user;
              const name = conversation.type === "GROUP" ? (conversation.group?.name ?? "Grupo") : formatUserName(other?.firstName ?? "", other?.lastName);
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
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-medium">{name || "Conversa"}</p>
                      {conversation.type === "GROUP" && <Badge variant="outline" className="text-[10px]">Grupo</Badge>}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{conversation.messages[0]?.content ?? "Sem mensagens ainda"}</p>
                  </div>
                  {conversation.unreadCount > 0 && <Badge>{conversation.unreadCount}</Badge>}
                </Link>
              );
            })}
            {conversations.length === 0 && (
              <p className="p-2 text-sm text-muted-foreground">
                Nenhuma conversa ainda. Clique em &quot;Iniciar mensagem direta&quot; acima ou entre em um grupo na aba Grupos.
              </p>
            )}
          </div>
        </TabsContent>
        <TabsContent value="grupos" className="flex-1 overflow-y-auto">
          <GroupsTab />
        </TabsContent>
      </Tabs>
      <StartDmDialog open={dmDialogOpen} onOpenChange={setDmDialogOpen} />
    </div>
  );
}
