"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatUserName } from "@/lib/social-format";

type UserResult = { id: string; firstName: string; lastName: string | null; imageUrl: string | null };

export function StartDmDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setResults([]);
      return;
    }
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/social/users/search?q=${encodeURIComponent(query)}`);
        const data = (await res.json()) as { users: UserResult[] };
        setResults(data.users ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, open]);

  async function startConversation(targetUserId: string) {
    try {
      const res = await fetch("/api/social/conversations/direct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao iniciar conversa");
      const { conversation } = (await res.json()) as { conversation: { id: string } };
      onOpenChange(false);
      router.push(`/social/c/${conversation.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao iniciar conversa");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova conversa</DialogTitle>
        </DialogHeader>
        <Input placeholder="Buscar pelo nome..." value={query} onChange={(event) => setQuery(event.target.value)} autoFocus />
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {loading && <p className="text-sm text-muted-foreground">Buscando...</p>}
          {!loading &&
            results.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => startConversation(user.id)}
                className="flex w-full items-center gap-3 rounded-md p-2 text-left text-sm hover:bg-muted"
              >
                <Avatar className="size-8">
                  <AvatarImage src={user.imageUrl ?? undefined} />
                  <AvatarFallback>{formatUserName(user.firstName, user.lastName)[0]}</AvatarFallback>
                </Avatar>
                <span>
                  {formatUserName(user.firstName, user.lastName)}
                </span>
              </button>
            ))}
          {!loading && query.trim() && results.length === 0 && <p className="text-sm text-muted-foreground">Nenhum usuario encontrado.</p>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
