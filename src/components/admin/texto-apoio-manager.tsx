"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TextoApoio } from "@/generated/prisma";

type FormState = { titulo: string; conteudo: string };

export function TextoApoioManager({ provaId, initialTextos }: { provaId: string; initialTextos: TextoApoio[] }) {
  const router = useRouter();
  const [textos, setTextos] = useState(initialTextos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TextoApoio | null>(null);
  const [form, setForm] = useState<FormState>({ titulo: "", conteudo: "" });
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm({ titulo: "", conteudo: "" });
    setOpen(true);
  }

  function openEdit(texto: TextoApoio) {
    setEditing(texto);
    setForm({ titulo: texto.titulo ?? "", conteudo: texto.conteudo });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      if (editing) {
        const response = await fetch(`/api/admin/textos-apoio/${editing.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ titulo: form.titulo || undefined, conteudo: form.conteudo }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Erro ao editar texto de apoio");
        setTextos((current) => current.map((item) => (item.id === editing.id ? data.textoApoio : item)));
        toast.success("Texto de apoio atualizado.");
      } else {
        const chave = `texto-${Date.now()}`;
        const response = await fetch(`/api/admin/provas/${provaId}/textos-apoio`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chave, titulo: form.titulo || undefined, conteudo: form.conteudo }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? "Erro ao criar texto de apoio");
        setTextos((current) => [...current, data.textoApoio]);
        toast.success("Texto de apoio criado.");
      }
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar texto de apoio");
    } finally {
      setSaving(false);
    }
  }

  async function remove(texto: TextoApoio) {
    if (!confirm(`Excluir o texto de apoio "${texto.titulo ?? texto.chave}"? As questoes vinculadas ficam sem texto.`)) return;
    try {
      const response = await fetch(`/api/admin/textos-apoio/${texto.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir texto de apoio");
      setTextos((current) => current.filter((item) => item.id !== texto.id));
      toast.success("Texto de apoio excluido.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir texto de apoio");
    }
  }

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" onClick={openCreate}>+ Novo texto de apoio</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar texto de apoio" : "Novo texto de apoio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titulo (opcional)</Label>
              <Input value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} placeholder="Texto 1A18-I" />
            </div>
            <div className="space-y-1">
              <Label>Conteudo</Label>
              <Textarea value={form.conteudo} onChange={(event) => setForm({ ...form, conteudo: event.target.value })} className="min-h-48 font-mono text-xs" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving || !form.conteudo}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {textos.length > 0 && (
        <ul className="space-y-2">
          {textos.map((texto) => (
            <li key={texto.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3 text-sm">
              <span className="truncate">{texto.titulo ?? texto.chave} — {texto.conteudo.slice(0, 80)}...</span>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(texto)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(texto)}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
