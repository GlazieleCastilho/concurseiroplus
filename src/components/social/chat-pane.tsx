"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageList, type ChatMessage } from "@/components/social/message-list";
import { MessageComposer } from "@/components/social/message-composer";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";

export function ChatPane({
  conversationId,
  title,
  imageUrl,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  title: string;
  imageUrl?: string | null;
  currentUserId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const pendingIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setMessages(initialMessages);
  }, [conversationId, initialMessages]);

  useEffect(() => {
    fetch(`/api/social/conversations/${conversationId}/read`, { method: "POST" }).catch(() => {});

    const channel = getSupabaseBrowserClient()
      .channel(`conversation:${conversationId}`)
      .on("broadcast", { event: "new_message" }, ({ payload }: { payload: unknown }) => {
        const incoming = payload as ChatMessage;
        setMessages((prev) => (prev.some((message) => message.id === incoming.id) ? prev : [...prev, incoming]));
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId]);

  async function handleSend(content: string) {
    const tempId = `temp-${crypto.randomUUID()}`;
    const optimistic: ChatMessage = {
      id: tempId,
      content,
      createdAt: new Date().toISOString(),
      senderId: currentUserId,
      sender: { id: currentUserId, firstName: "Voce", lastName: null, imageUrl: null },
      pending: true,
    };
    pendingIdsRef.current.add(tempId);
    setMessages((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/social/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao enviar mensagem");
      const { message } = (await res.json()) as { message: ChatMessage };
      setMessages((prev) => prev.map((item) => (item.id === tempId ? message : item)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");
      setMessages((prev) => prev.filter((item) => item.id !== tempId));
    } finally {
      pendingIdsRef.current.delete(tempId);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <Avatar>
          <AvatarImage src={imageUrl ?? undefined} />
          <AvatarFallback>{title[0]}</AvatarFallback>
        </Avatar>
        <p className="font-semibold">{title}</p>
      </div>
      <MessageList messages={messages} currentUserId={currentUserId} />
      <MessageComposer onSend={handleSend} />
    </div>
  );
}
