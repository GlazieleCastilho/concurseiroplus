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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { PlannerRecurrence, PlannerStatus, PlannerTask } from "@/generated/prisma";

type TaskFormState = {
  title: string;
  description: string;
  discipline: string;
  goal: string;
  status: PlannerStatus;
  recurrence: PlannerRecurrence;
  startsAt: string;
  dueAt: string;
};

const emptyForm: TaskFormState = {
  title: "",
  description: "",
  discipline: "",
  goal: "",
  status: "TODO",
  recurrence: "NONE",
  startsAt: "",
  dueAt: "",
};

const STATUS_LABELS: Record<PlannerStatus, string> = {
  TODO: "A fazer",
  DOING: "Fazendo",
  DONE: "Concluida",
  CANCELED: "Cancelada",
};

const STATUS_BADGE_CLASS: Record<PlannerStatus, string> = {
  TODO: "bg-muted text-muted-foreground",
  DOING: "bg-yellow-500/15 text-yellow-500",
  DONE: "bg-green-500/15 text-green-500",
  CANCELED: "bg-red-500/15 text-red-500",
};

const NEXT_STATUS: Record<PlannerStatus, PlannerStatus> = {
  TODO: "DOING",
  DOING: "DONE",
  DONE: "TODO",
  CANCELED: "TODO",
};

function toDateInputValue(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

export function PlannerManager({ initialTasks }: { initialTasks: PlannerTask[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PlannerTask | null>(null);
  const [form, setForm] = useState<TaskFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(task: PlannerTask) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      discipline: task.discipline ?? "",
      goal: task.goal ?? "",
      status: task.status,
      recurrence: task.recurrence,
      startsAt: toDateInputValue(task.startsAt),
      dueAt: toDateInputValue(task.dueAt),
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        discipline: form.discipline || undefined,
        goal: form.goal || undefined,
        status: form.status,
        recurrence: form.recurrence,
        startsAt: form.startsAt || undefined,
        dueAt: form.dueAt || undefined,
      };
      const response = await fetch(editing ? `/api/planner/${editing.id}` : "/api/planner", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar tarefa");
      toast.success(editing ? "Tarefa atualizada." : "Tarefa criada.");
      setOpen(false);
      router.refresh();
      if (!editing) {
        setTasks((current) => [data.task, ...current]);
      } else {
        setTasks((current) => current.map((item) => (item.id === data.task.id ? data.task : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar tarefa");
    } finally {
      setSaving(false);
    }
  }

  async function cycleStatus(task: PlannerTask) {
    const nextStatus = NEXT_STATUS[task.status];
    try {
      const response = await fetch(`/api/planner/${task.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao atualizar status");
      setTasks((current) => current.map((item) => (item.id === task.id ? data.task : item)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar status");
    }
  }

  async function remove(task: PlannerTask) {
    if (!confirm(`Excluir a tarefa "${task.title}"?`)) return;
    try {
      const response = await fetch(`/api/planner/${task.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir tarefa");
      toast.success("Tarefa excluida.");
      setTasks((current) => current.filter((item) => item.id !== task.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir tarefa");
    }
  }

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={openCreate}>+ Nova tarefa</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar tarefa" : "Nova tarefa"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titulo</Label>
              <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Revisar direito constitucional" />
            </div>
            <div className="space-y-1">
              <Label>Descricao</Label>
              <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Disciplina</Label>
                <Input value={form.discipline} onChange={(event) => setForm({ ...form, discipline: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Meta</Label>
                <Input value={form.goal} onChange={(event) => setForm({ ...form, goal: event.target.value })} placeholder="2 capitulos" />
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as PlannerStatus })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODO">A fazer</SelectItem>
                    <SelectItem value="DOING">Fazendo</SelectItem>
                    <SelectItem value="DONE">Concluida</SelectItem>
                    <SelectItem value="CANCELED">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Recorrencia</Label>
                <Select value={form.recurrence} onValueChange={(value) => setForm({ ...form, recurrence: value as PlannerRecurrence })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NONE">Nenhuma</SelectItem>
                    <SelectItem value="DAILY">Diaria</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Inicio</Label>
                <Input type="date" value={form.startsAt} onChange={(event) => setForm({ ...form, startsAt: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Prazo</Label>
                <Input type="date" value={form.dueAt} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving || !form.title}>{saving ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma tarefa cadastrada ainda.</p>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="rounded-md border border-border p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{task.title}</strong>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => cycleStatus(task)}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[task.status]}`}
                  title="Clique para mudar o status"
                >
                  {STATUS_LABELS[task.status]}
                </button>
                <Button size="sm" variant="outline" onClick={() => openEdit(task)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(task)}>Excluir</Button>
              </div>
            </div>
            {task.description && <p className="mt-2 text-sm text-muted-foreground">{task.description}</p>}
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {task.discipline && <span>Disciplina: {task.discipline}</span>}
              {task.goal && <span>Meta: {task.goal}</span>}
              {task.dueAt && <span>Prazo: {new Date(task.dueAt).toLocaleDateString("pt-BR")}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
