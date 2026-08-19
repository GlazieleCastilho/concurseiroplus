"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateGroupDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/social/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, discipline, description: description || undefined }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao criar grupo");
      const { group } = (await res.json()) as { group: { conversationId: string } };
      setOpen(false);
      setName("");
      setDiscipline("");
      setDescription("");
      router.push(`/social/c/${group.conversationId}`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar grupo");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Criar grupo</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar grupo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="group-name">Nome</Label>
            <Input id="group-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={3} maxLength={80} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="group-discipline">Disciplina</Label>
            <Input id="group-discipline" value={discipline} onChange={(event) => setDiscipline(event.target.value)} required minLength={2} maxLength={60} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="group-description">Descricao (opcional)</Label>
            <Textarea id="group-description" value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={saving}>
              {saving ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
