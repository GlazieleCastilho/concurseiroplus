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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Alternativa, Difficulty, Questao, QuestionType, TextoApoio } from "@/generated/prisma";

type QuestaoWithAlternativas = Questao & { alternativas: Alternativa[] };

type AltForm = { letra: string; texto: string; correta: boolean };

const NONE_TEXTO = "__none__";

type QuestaoFormState = {
  numero: string;
  tipo: QuestionType;
  enunciado: string;
  disciplina: string;
  assunto: string;
  dificuldade: Difficulty;
  gabarito: string;
  comentario: string;
  alternativas: AltForm[];
  textoApoioId: string;
};

function emptyForm(nextNumero: number): QuestaoFormState {
  return {
    numero: String(nextNumero),
    tipo: "OBJETIVA",
    enunciado: "",
    disciplina: "",
    assunto: "",
    dificuldade: "MEDIUM",
    gabarito: "",
    comentario: "",
    alternativas: [
      { letra: "A", texto: "", correta: false },
      { letra: "B", texto: "", correta: false },
      { letra: "C", texto: "", correta: false },
      { letra: "D", texto: "", correta: false },
    ],
    textoApoioId: NONE_TEXTO,
  };
}

export function QuestaoManager({
  provaId,
  initialQuestoes,
  textosApoio,
}: {
  provaId: string;
  initialQuestoes: QuestaoWithAlternativas[];
  textosApoio: TextoApoio[];
}) {
  const router = useRouter();
  const [questoes, setQuestoes] = useState(initialQuestoes);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuestaoWithAlternativas | null>(null);
  const [form, setForm] = useState<QuestaoFormState>(emptyForm(1));
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    const nextNumero = questoes.reduce((max, item) => Math.max(max, item.numero), 0) + 1;
    setForm(emptyForm(nextNumero));
    setOpen(true);
  }

  function openEdit(questao: QuestaoWithAlternativas) {
    setEditing(questao);
    setForm({
      numero: String(questao.numero),
      tipo: questao.tipo,
      enunciado: questao.enunciado,
      disciplina: questao.disciplina ?? "",
      assunto: questao.assunto ?? "",
      dificuldade: questao.dificuldade,
      gabarito: questao.gabarito ?? "",
      comentario: questao.comentario ?? "",
      alternativas: questao.alternativas.length
        ? questao.alternativas.map((alt) => ({ letra: alt.letra, texto: alt.texto, correta: alt.correta }))
        : emptyForm(questao.numero).alternativas,
      textoApoioId: questao.textoApoioId ?? NONE_TEXTO,
    });
    setOpen(true);
  }

  function updateAlternativa(index: number, patch: Partial<AltForm>) {
    setForm((current) => ({
      ...current,
      alternativas: current.alternativas.map((alt, i) => (i === index ? { ...alt, ...patch } : alt)),
    }));
  }

  function markCorreta(index: number) {
    setForm((current) => ({
      ...current,
      alternativas: current.alternativas.map((alt, i) => ({ ...alt, correta: i === index })),
    }));
  }

  function addAlternativa() {
    setForm((current) => {
      if (current.alternativas.length >= 6) return current;
      const nextLetra = String.fromCharCode(65 + current.alternativas.length);
      return { ...current, alternativas: [...current.alternativas, { letra: nextLetra, texto: "", correta: false }] };
    });
  }

  function removeAlternativa(index: number) {
    setForm((current) => ({ ...current, alternativas: current.alternativas.filter((_, i) => i !== index) }));
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        numero: Number(form.numero),
        tipo: form.tipo,
        enunciado: form.enunciado,
        disciplina: form.disciplina || undefined,
        assunto: form.assunto || undefined,
        dificuldade: form.dificuldade,
        gabarito: form.gabarito || undefined,
        comentario: form.comentario || undefined,
        alternativas: form.tipo === "DISSERTATIVA" ? [] : form.alternativas.filter((alt) => alt.texto.trim().length > 0),
        textoApoioId: form.textoApoioId === NONE_TEXTO ? undefined : form.textoApoioId,
      };
      const url = editing ? `/api/admin/questoes/${editing.id}` : `/api/admin/provas/${provaId}/questoes`;
      const response = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar questao");
      toast.success(editing ? "Questao atualizada." : "Questao criada.");
      setOpen(false);
      router.refresh();
      const saved: QuestaoWithAlternativas = data.questao;
      setQuestoes((current) => {
        if (editing) return current.map((item) => (item.id === saved.id ? saved : item));
        return [...current, saved].sort((a, b) => a.numero - b.numero);
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar questao");
    } finally {
      setSaving(false);
    }
  }

  async function remove(questao: QuestaoWithAlternativas) {
    if (!confirm(`Excluir a questao ${questao.numero}?`)) return;
    try {
      const response = await fetch(`/api/admin/questoes/${questao.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir questao");
      toast.success("Questao excluida.");
      setQuestoes((current) => current.filter((item) => item.id !== questao.id));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir questao");
    }
  }

  return (
    <div className="space-y-4">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={openCreate}>+ Nova questao</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar questao ${editing.numero}` : "Nova questao"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label>Numero</Label>
                <Input type="number" value={form.numero} onChange={(event) => setForm({ ...form, numero: event.target.value })} />
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={(value) => setForm({ ...form, tipo: value as QuestionType })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OBJETIVA">Objetiva</SelectItem>
                    <SelectItem value="CERTO_ERRADO">Certo/Errado</SelectItem>
                    <SelectItem value="DISSERTATIVA">Dissertativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 sm:col-span-1">
                <Label>Dificuldade</Label>
                <Select value={form.dificuldade} onValueChange={(value) => setForm({ ...form, dificuldade: value as Difficulty })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Facil</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HARD">Dificil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Gabarito</Label>
                <Input value={form.gabarito} onChange={(event) => setForm({ ...form, gabarito: event.target.value })} placeholder="C" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Disciplina</Label>
                <Input value={form.disciplina} onChange={(event) => setForm({ ...form, disciplina: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Assunto</Label>
                <Input value={form.assunto} onChange={(event) => setForm({ ...form, assunto: event.target.value })} />
              </div>
            </div>
            {textosApoio.length > 0 && (
              <div className="space-y-1">
                <Label>Texto de apoio (opcional)</Label>
                <Select value={form.textoApoioId} onValueChange={(value) => setForm({ ...form, textoApoioId: value })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE_TEXTO}>Nenhum</SelectItem>
                    {textosApoio.map((texto) => (
                      <SelectItem key={texto.id} value={texto.id}>{texto.titulo ?? texto.chave}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1">
              <Label>Enunciado</Label>
              <Textarea value={form.enunciado} onChange={(event) => setForm({ ...form, enunciado: event.target.value })} className="min-h-28" />
            </div>

            {form.tipo !== "DISSERTATIVA" && (
              <div className="space-y-2">
                <Label>Alternativas (clique em &quot;Correta&quot; para marcar o gabarito)</Label>
                {form.alternativas.map((alt, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="w-6 text-sm font-medium">{alt.letra}</span>
                    <Input
                      value={alt.texto}
                      onChange={(event) => updateAlternativa(index, { texto: event.target.value })}
                      placeholder={`Texto da alternativa ${alt.letra}`}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant={alt.correta ? "default" : "outline"}
                      className={cn(alt.correta && "bg-emerald-600 hover:bg-emerald-600/90")}
                      onClick={() => markCorreta(index)}
                    >
                      Correta
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => removeAlternativa(index)}>Remover</Button>
                  </div>
                ))}
                {form.alternativas.length < 6 && (
                  <Button type="button" size="sm" variant="outline" onClick={addAlternativa}>+ Alternativa</Button>
                )}
              </div>
            )}

            <div className="space-y-1">
              <Label>Comentario (opcional, exibido apos o simulado)</Label>
              <Textarea value={form.comentario} onChange={(event) => setForm({ ...form, comentario: event.target.value })} className="min-h-20" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving || !form.enunciado || !form.numero}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">Nº</TableHead>
            <TableHead>Enunciado</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Dificuldade</TableHead>
            <TableHead>Gabarito</TableHead>
            <TableHead>Texto de apoio</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questoes.map((questao) => (
            <TableRow key={questao.id}>
              <TableCell>{questao.numero}</TableCell>
              <TableCell className="max-w-[360px] truncate">{questao.enunciado}</TableCell>
              <TableCell>{questao.tipo}</TableCell>
              <TableCell>{questao.dificuldade}</TableCell>
              <TableCell>{questao.gabarito ?? "-"}</TableCell>
              <TableCell>{textosApoio.find((texto) => texto.id === questao.textoApoioId)?.titulo ?? textosApoio.find((texto) => texto.id === questao.textoApoioId)?.chave ?? "-"}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button size="sm" variant="outline" onClick={() => openEdit(questao)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(questao)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {questoes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                Nenhuma questao cadastrada ainda.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
