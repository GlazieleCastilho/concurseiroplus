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
import type { Concurso, ConcursoStatus, ExamLevel } from "@/generated/prisma";

const NIVEL_OPTIONS: ExamLevel[] = ["FUNDAMENTAL", "MEDIO", "SUPERIOR"];
const NIVEL_LABELS: Record<ExamLevel, string> = {
  FUNDAMENTAL: "Fundamental",
  MEDIO: "Medio",
  SUPERIOR: "Superior",
};

type ConcursoFormState = {
  titulo: string;
  orgao: string;
  banca: string;
  cargo: string;
  ano: string;
  nivel: ExamLevel[];
  status: ConcursoStatus;
  dataProva: string;
  inscricaoInicio: string;
  inscricaoFim: string;
  vagas: string;
  salario: string;
  editalUrl: string;
};

const emptyForm: ConcursoFormState = {
  titulo: "",
  orgao: "",
  banca: "",
  cargo: "",
  ano: String(new Date().getFullYear()),
  nivel: ["SUPERIOR"],
  status: "PREVISTO",
  dataProva: "",
  inscricaoInicio: "",
  inscricaoFim: "",
  vagas: "",
  salario: "",
  editalUrl: "",
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

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function ConcursoManager({ initialConcursos }: { initialConcursos: Concurso[] }) {
  const router = useRouter();
  const [concursos, setConcursos] = useState(initialConcursos);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Concurso | null>(null);
  const [form, setForm] = useState<ConcursoFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(concurso: Concurso) {
    setEditing(concurso);
    setForm({
      titulo: concurso.titulo,
      orgao: concurso.orgao,
      banca: concurso.banca,
      cargo: concurso.cargo,
      ano: String(concurso.ano),
      nivel: concurso.nivel,
      status: concurso.status,
      dataProva: toDateInputValue(concurso.dataProva),
      inscricaoInicio: toDateInputValue(concurso.inscricaoInicio),
      inscricaoFim: toDateInputValue(concurso.inscricaoFim),
      vagas: concurso.vagas ? String(concurso.vagas) : "",
      salario: concurso.salario ?? "",
      editalUrl: concurso.editalUrl ?? "",
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
        dataProva: form.dataProva || undefined,
        inscricaoInicio: form.inscricaoInicio || undefined,
        inscricaoFim: form.inscricaoFim || undefined,
        vagas: form.vagas ? Number(form.vagas) : undefined,
        salario: form.salario || undefined,
        editalUrl: form.editalUrl || undefined,
      };
      const response = await fetch(editing ? `/api/admin/concursos/${editing.id}` : "/api/admin/concursos", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar concurso");
      toast.success(editing ? "Concurso atualizado." : "Concurso criado.");
      setOpen(false);
      router.refresh();
      if (!editing) {
        setConcursos((current) => [data.concurso, ...current]);
      } else {
        setConcursos((current) => current.map((item) => (item.id === data.concurso.id ? { ...item, ...data.concurso } : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar concurso");
    } finally {
      setSaving(false);
    }
  }

  async function remove(concurso: Concurso) {
    if (!confirm(`Excluir o concurso "${concurso.titulo}"?`)) return;
    try {
      const response = await fetch(`/api/admin/concursos/${concurso.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir concurso");
      toast.success("Concurso excluido.");
      setConcursos((current) => current.filter((item) => item.id !== concurso.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir concurso");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>+ Novo edital</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar edital" : "Novo edital"}</DialogTitle>
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
                <div className="space-y-1 sm:col-span-2">
                  <Label>Nivel (selecione um ou mais)</Label>
                  <div className="flex flex-wrap gap-2">
                    {NIVEL_OPTIONS.map((nivel) => {
                      const selected = form.nivel.includes(nivel);
                      return (
                        <button
                          key={nivel}
                          type="button"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              nivel: selected ? current.nivel.filter((item) => item !== nivel) : [...current.nivel, nivel],
                            }))
                          }
                          className={`rounded-md border px-3 py-1.5 text-sm ${selected ? "border-accent bg-accent/10" : "border-border"}`}
                        >
                          {NIVEL_LABELS[nivel]}
                        </button>
                      );
                    })}
                  </div>
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
                <div className="space-y-1">
                  <Label>Data da prova</Label>
                  <Input type="date" value={form.dataProva} onChange={(event) => setForm({ ...form, dataProva: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Vagas</Label>
                  <Input type="number" value={form.vagas} onChange={(event) => setForm({ ...form, vagas: event.target.value })} placeholder="Ex: 120" />
                </div>
                <div className="space-y-1">
                  <Label>Inscricoes de</Label>
                  <Input type="date" value={form.inscricaoInicio} onChange={(event) => setForm({ ...form, inscricaoInicio: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Inscricoes ate</Label>
                  <Input type="date" value={form.inscricaoFim} onChange={(event) => setForm({ ...form, inscricaoFim: event.target.value })} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Salario</Label>
                  <Input value={form.salario} onChange={(event) => setForm({ ...form, salario: event.target.value })} placeholder="Ex: R$ 5.000,00 a R$ 12.000,00" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Link do edital</Label>
                  <Input value={form.editalUrl} onChange={(event) => setForm({ ...form, editalUrl: event.target.value })} placeholder="https://..." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving || !form.titulo || !form.orgao || !form.banca || !form.cargo || form.nivel.length === 0}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titulo</TableHead>
            <TableHead>Orgao</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Vagas</TableHead>
            <TableHead>Inscricoes</TableHead>
            <TableHead>Data da prova</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {concursos.map((concurso) => (
            <TableRow key={concurso.id}>
              <TableCell className="max-w-[220px] truncate font-medium">{concurso.titulo}</TableCell>
              <TableCell>{concurso.orgao}</TableCell>
              <TableCell>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[concurso.status]}`}>
                  {STATUS_LABELS[concurso.status]}
                </span>
              </TableCell>
              <TableCell>{concurso.vagas ?? "-"}</TableCell>
              <TableCell className="text-xs">
                {concurso.inscricaoInicio || concurso.inscricaoFim
                  ? `${concurso.inscricaoInicio ? new Date(concurso.inscricaoInicio).toLocaleDateString("pt-BR") : "?"} a ${concurso.inscricaoFim ? new Date(concurso.inscricaoFim).toLocaleDateString("pt-BR") : "?"}`
                  : "-"}
              </TableCell>
              <TableCell>{concurso.dataProva ? new Date(concurso.dataProva).toLocaleDateString("pt-BR") : "A definir"}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                {concurso.editalUrl && (
                  <Link href={concurso.editalUrl} target="_blank">
                    <Button size="sm" variant="outline">Edital</Button>
                  </Link>
                )}
                <Button size="sm" variant="outline" onClick={() => openEdit(concurso)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(concurso)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {concursos.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                Nenhum concurso cadastrado ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
