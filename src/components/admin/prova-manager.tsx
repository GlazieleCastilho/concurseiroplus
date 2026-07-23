"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ConcursoStatus, ExamLevel, Prova } from "@/generated/prisma";

type ProvaWithCount = Prova & { _count: { questoes: number } };

type ProvaFormState = {
  titulo: string;
  orgao: string;
  banca: string;
  cargo: string;
  ano: string;
  nivel: ExamLevel;
  status: ConcursoStatus;
  duracaoMin: string;
};

const emptyForm: ProvaFormState = {
  titulo: "",
  orgao: "",
  banca: "",
  cargo: "",
  ano: String(new Date().getFullYear()),
  nivel: "SUPERIOR",
  status: "PREVISTO",
  duracaoMin: "240",
};

const STATUS_LABELS: Record<ConcursoStatus, string> = {
  PREVISTO: "Previsto",
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  FECHADO: "Fechado",
};

const STATUS_BADGE_CLASS: Record<ConcursoStatus, string> = {
  PREVISTO: "bg-muted text-muted-foreground",
  ABERTO: "bg-green-500/15 text-green-500",
  EM_ANDAMENTO: "bg-yellow-500/15 text-yellow-500",
  FECHADO: "bg-red-500/15 text-red-500",
};

export function ProvaManager({ initialProvas }: { initialProvas: ProvaWithCount[] }) {
  const router = useRouter();
  const [provas, setProvas] = useState(initialProvas);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProvaWithCount | null>(null);
  const [form, setForm] = useState<ProvaFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(prova: ProvaWithCount) {
    setEditing(prova);
    setForm({
      titulo: prova.titulo,
      orgao: prova.orgao,
      banca: prova.banca,
      cargo: prova.cargo,
      ano: String(prova.ano),
      nivel: prova.nivel,
      status: prova.status,
      duracaoMin: String(prova.duracaoMin),
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        titulo: form.titulo,
        orgao: form.orgao,
        banca: form.banca,
        cargo: form.cargo,
        ano: Number(form.ano),
        nivel: form.nivel,
        status: form.status,
        duracaoMin: Number(form.duracaoMin),
      };
      const response = await fetch(editing ? `/api/admin/provas/${editing.id}` : "/api/admin/provas", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar prova");
      toast.success(editing ? "Prova atualizada." : "Prova criada.");
      setOpen(false);
      router.refresh();
      if (!editing) {
        setProvas((current) => [{ ...data.prova, _count: { questoes: 0 } }, ...current]);
      } else {
        setProvas((current) => current.map((item) => (item.id === data.prova.id ? { ...item, ...data.prova } : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar prova");
    } finally {
      setSaving(false);
    }
  }

  async function remove(prova: ProvaWithCount) {
    if (!confirm(`Excluir a prova "${prova.titulo}" e todas as suas ${prova._count.questoes} questoes?`)) return;
    try {
      const response = await fetch(`/api/admin/provas/${prova.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir prova");
      toast.success("Prova excluida.");
      setProvas((current) => current.filter((item) => item.id !== prova.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir prova");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>+ Nova prova</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar prova" : "Nova prova"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Titulo</Label>
                  <Input value={form.titulo} onChange={(event) => setForm({ ...form, titulo: event.target.value })} placeholder="Receita Federal 2024 - Auditor Fiscal" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label>Orgao</Label>
                    <Input value={form.orgao} onChange={(event) => setForm({ ...form, orgao: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Banca</Label>
                    <Input value={form.banca} onChange={(event) => setForm({ ...form, banca: event.target.value })} placeholder="CESPE, FGV, FCC..." />
                  </div>
                  <div className="space-y-1">
                    <Label>Cargo</Label>
                    <Input value={form.cargo} onChange={(event) => setForm({ ...form, cargo: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Ano</Label>
                    <Input type="number" value={form.ano} onChange={(event) => setForm({ ...form, ano: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Nivel</Label>
                    <Select value={form.nivel} onValueChange={(value) => setForm({ ...form, nivel: value as ExamLevel })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNDAMENTAL">Fundamental</SelectItem>
                        <SelectItem value="MEDIO">Medio</SelectItem>
                        <SelectItem value="SUPERIOR">Superior</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Duracao (min)</Label>
                    <Input type="number" value={form.duracaoMin} onChange={(event) => setForm({ ...form, duracaoMin: event.target.value })} />
                  </div>
                  <div className="space-y-1">
                    <Label>Status do concurso</Label>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as ConcursoStatus })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PREVISTO">Previsto</SelectItem>
                        <SelectItem value="ABERTO">Aberto</SelectItem>
                        <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                        <SelectItem value="FECHADO">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button onClick={save} disabled={saving || !form.titulo || !form.orgao || !form.banca || !form.cargo}>
                  {saving ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Link href="/admin/questions/importar">
            <Button variant="outline">Importar em massa</Button>
          </Link>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titulo</TableHead>
            <TableHead>Banca</TableHead>
            <TableHead>Orgao</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Ano</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Questoes</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {provas.map((prova) => (
            <TableRow key={prova.id}>
              <TableCell className="max-w-[240px] truncate font-medium">{prova.titulo}</TableCell>
              <TableCell>{prova.banca}</TableCell>
              <TableCell>{prova.orgao}</TableCell>
              <TableCell>{prova.cargo}</TableCell>
              <TableCell>{prova.ano}</TableCell>
              <TableCell>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[prova.status]}`}>
                  {STATUS_LABELS[prova.status]}
                </span>
              </TableCell>
              <TableCell>{prova._count.questoes}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Link href={`/admin/questions/${prova.id}`}>
                  <Button size="sm" variant="outline">Questoes</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => openEdit(prova)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(prova)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {provas.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                Nenhuma prova cadastrada ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
