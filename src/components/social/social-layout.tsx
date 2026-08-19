"use client";

import { ConversationSidebar, type ConversationSummary } from "@/components/social/conversation-sidebar";

export function SocialLayout({
  conversations,
  currentUserId,
  children,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-lg border border-border">
      <ConversationSidebar conversations={conversations} currentUserId={currentUserId} />
      <div className="flex-1">
        {children ?? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Escolha uma conversa ou entre em um grupo pra comecar.
          </div>
        )}
      </div>
    </div>
  );
}
