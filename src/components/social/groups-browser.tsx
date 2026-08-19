"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateGroupDialog } from "@/components/social/create-group-dialog";

export type GroupSummary = {
  id: string;
  name: string;
  discipline: string;
  description: string | null;
  memberCount: number;
  isMember: boolean;
  conversation: { id: string } | null;
};

export function GroupsBrowser({ groups }: { groups: GroupSummary[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [localGroups, setLocalGroups] = useState(groups);

  async function toggleMembership(group: GroupSummary) {
    setPendingId(group.id);
    try {
      const action = group.isMember ? "leave" : "join";
      const res = await fetch(`/api/social/groups/${group.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao atualizar grupo");
      setLocalGroups((prev) =>
        prev.map((item) =>
          item.id === group.id
            ? { ...item, isMember: !item.isMember, memberCount: item.memberCount + (item.isMember ? -1 : 1) }
            : item,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar grupo");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Grupos abertos organizados por disciplina</p>
          <h1 className="font-display text-3xl font-bold">Grupos</h1>
        </div>
        <CreateGroupDialog />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {localGroups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline">{group.discipline}</Badge>
                <span className="text-xs text-muted-foreground">{group.memberCount} membros</span>
              </div>
              <CardTitle>{group.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
              <div className="flex gap-2">
                <Button
                  variant={group.isMember ? "outline" : "default"}
                  disabled={pendingId === group.id}
                  onClick={() => toggleMembership(group)}
                >
                  {group.isMember ? "Sair" : "Entrar"}
                </Button>
                {group.isMember && group.conversation && (
                  <Button variant="ghost" onClick={() => router.push(`/social/c/${group.conversation!.id}`)}>
                    Abrir chat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {localGroups.length === 0 && (
          <Card>
            <CardContent className="pt-0 text-sm text-muted-foreground">Nenhum grupo criado ainda. Seja o primeiro a criar um.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
