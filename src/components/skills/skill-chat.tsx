"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Message = { role: "user" | "assistant"; content: string };

export function SkillChat({ slug, title }: { slug: string; title: string }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const current = message.trim();
    if (!current) return;
    setMessage("");
    setLoading(true);
    const nextMessages: Message[] = [...messages, { role: "user", content: current }, { role: "assistant", content: "" }];
    setMessages(nextMessages);

    try {
      const response = await fetch(`/api/skills/${slug}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: current, history: messages.slice(-10) }),
      });
      if (!response.ok || !response.body) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Nao foi possivel falar com a Skill");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const eventChunk of chunk.split("\n\n")) {
          const dataLine = eventChunk.split("\n").find((line) => line.startsWith("data: "));
          if (!dataLine) continue;
          const data = dataLine.slice(6);
          if (data === "[DONE]") continue;
          answer += JSON.parse(data).token as string;
          setMessages((currentMessages) => currentMessages.map((item, index) => index === currentMessages.length - 1 ? { ...item, content: answer } : item));
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro no chat");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="min-h-[70vh]">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex min-h-[60vh] flex-col gap-4">
        <div className="flex-1 space-y-3 overflow-auto rounded-md border border-border bg-background/60 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">Pergunte uma duvida, envie uma questao ou peça um plano de revisao por topico.</p>
          ) : messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`max-w-[85%] rounded-md border p-3 text-sm ${item.role === "user" ? "ml-auto border-accent/50 bg-accent/10" : "border-border bg-card"}`}>
              <p className="whitespace-pre-wrap">{item.content || "..."}</p>
            </div>
          ))}
        </div>
        <form onSubmit={send} className="flex gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-12 flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            placeholder="Digite sua pergunta..."
            required
          />
          <Button disabled={loading} type="submit">{loading ? "Enviando" : "Enviar"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
