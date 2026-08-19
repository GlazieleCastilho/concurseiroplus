"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateGroupDialog } from "@/components/social/create-group-dialog";

type GroupSummary = {
  id: string;
  name: string;
  discipline: string;
  memberCount: number;
  isMember: boolean;
  conversation: { id: string } | null;
};

export function GroupsTab() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function loadGroups() {
    setLoading(true);
    try {
      const res = await fetch("/api/social/groups");
      const data = (await res.json()) as { groups: GroupSummary[] };
      setGroups(data.groups ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGroups();
  }, []);

  async function toggleMembership(group: GroupSummary) {
    setPendingId(group.id);
    try {
      const action = group.isMember ? "leave" : "join";
      const res = await fetch(`/api/social/groups/${group.id}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao atualizar grupo");
      await loadGroups();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar grupo");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="space-y-2 p-2">
      <CreateGroupDialog />
      {loading && <p className="p-2 text-sm text-muted-foreground">Carregando...</p>}
      {!loading && groups.length === 0 && <p className="p-2 text-sm text-muted-foreground">Nenhum grupo criado ainda. Seja o primeiro a criar um.</p>}
      {groups.map((group) => (
        <div key={group.id} className="rounded-md border border-border p-2">
          <p className="text-sm font-medium">{group.name}</p>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline">{group.discipline}</Badge>
            <span>{group.memberCount} membros</span>
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              size="sm"
              variant={group.isMember ? "outline" : "default"}
              disabled={pendingId === group.id}
              onClick={() => toggleMembership(group)}
            >
              {group.isMember ? "Sair" : "Entrar"}
            </Button>
            {group.isMember && group.conversation && (
              <Button size="sm" variant="ghost" onClick={() => router.push(`/social/c/${group.conversation!.id}`)}>
                Abrir chat
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
