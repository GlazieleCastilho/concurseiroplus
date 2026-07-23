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

export function ConcursoManager({ initialProvas }: { initialProvas: ProvaWithCount[] }) {
  const router = useRouter();
  const [provas, setProvas] = useState(initialProvas);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProvaWithCount | null>(null);
  const [form, setForm] = useState<ConcursoFormState>(emptyForm);
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
      dataProva: toDateInputValue(prova.dataProva),
      inscricaoInicio: toDateInputValue(prova.inscricaoInicio),
      inscricaoFim: toDateInputValue(prova.inscricaoFim),
      vagas: prova.vagas ? String(prova.vagas) : "",
      salario: prova.salario ?? "",
      editalUrl: prova.editalUrl ?? "",
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
      const response = await fetch(editing ? `/api/admin/provas/${editing.id}` : "/api/admin/provas", {
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
        setProvas((current) => [{ ...data.prova, _count: { questoes: 0 } }, ...current]);
      } else {
        setProvas((current) => current.map((item) => (item.id === data.prova.id ? { ...item, ...data.prova } : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar concurso");
    } finally {
      setSaving(false);
    }
  }

  async function remove(prova: ProvaWithCount) {
    if (!confirm(`Excluir o concurso "${prova.titulo}"? Isso tambem exclui as ${prova._count.questoes} questoes associadas.`)) return;
    try {
      const response = await fetch(`/api/admin/provas/${prova.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir concurso");
      toast.success("Concurso excluido.");
      setProvas((current) => current.filter((item) => item.id !== prova.id));
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
          {provas.map((prova) => (
            <TableRow key={prova.id}>
              <TableCell className="max-w-[220px] truncate font-medium">{prova.titulo}</TableCell>
              <TableCell>{prova.orgao}</TableCell>
              <TableCell>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[prova.status]}`}>
                  {STATUS_LABELS[prova.status]}
                </span>
              </TableCell>
              <TableCell>{prova.vagas ?? "-"}</TableCell>
              <TableCell className="text-xs">
                {prova.inscricaoInicio || prova.inscricaoFim
                  ? `${prova.inscricaoInicio ? new Date(prova.inscricaoInicio).toLocaleDateString("pt-BR") : "?"} a ${prova.inscricaoFim ? new Date(prova.inscricaoFim).toLocaleDateString("pt-BR") : "?"}`
                  : "-"}
              </TableCell>
              <TableCell>{prova.dataProva ? new Date(prova.dataProva).toLocaleDateString("pt-BR") : "A definir"}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                {prova.editalUrl && (
                  <Link href={prova.editalUrl} target="_blank">
                    <Button size="sm" variant="outline">Edital</Button>
                  </Link>
                )}
                <Button size="sm" variant="outline" onClick={() => openEdit(prova)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(prova)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {provas.length === 0 && (
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
