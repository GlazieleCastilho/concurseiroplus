"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type ChatMessage = {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  sender: { id: string; firstName: string; lastName: string | null; imageUrl: string | null };
  pending?: boolean;
};

export function MessageList({ messages, currentUserId }: { messages: ChatMessage[]; currentUserId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4">
      {messages.length === 0 && <p className="text-center text-sm text-muted-foreground">Nenhuma mensagem ainda. Diga oi!</p>}
      {messages.map((message) => {
        const isOwn = message.senderId === currentUserId;
        return (
          <div key={message.id} className={`flex items-end gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
            {!isOwn && (
              <Avatar className="size-7">
                <AvatarImage src={message.sender.imageUrl ?? undefined} />
                <AvatarFallback>{message.sender.firstName[0]}</AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
              } ${message.pending ? "opacity-60" : ""}`}
            >
              {!isOwn && <p className="mb-1 text-xs font-semibold opacity-70">{message.sender.firstName}</p>}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
