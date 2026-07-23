"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
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

const COLUMNS: { status: PlannerStatus; label: string; accent: string }[] = [
  { status: "TODO", label: "A fazer", accent: "border-t-muted-foreground" },
  { status: "DOING", label: "Fazendo", accent: "border-t-yellow-500" },
  { status: "DONE", label: "Concluida", accent: "border-t-green-500" },
  { status: "CANCELED", label: "Cancelada", accent: "border-t-red-500" },
];

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

  function openCreate(status: PlannerStatus = "TODO") {
    setEditing(null);
    setForm({ ...emptyForm, status });
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

  async function updateStatus(taskId: string, status: PlannerStatus) {
    const response = await fetch(`/api/planner/${taskId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Erro ao atualizar status");
    return data.task as PlannerTask;
  }

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const novoStatus = destination.droppableId as PlannerStatus;
    const previous = tasks;
    setTasks((current) => current.map((task) => (task.id === draggableId ? { ...task, status: novoStatus } : task)));
    try {
      const updated = await updateStatus(draggableId, novoStatus);
      setTasks((current) => current.map((task) => (task.id === updated.id ? updated : task)));
    } catch (error) {
      setTasks(previous);
      toast.error(error instanceof Error ? error.message : "Erro ao mover tarefa");
    }
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
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openCreate()}>+ Nova tarefa</Button>
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
                      {COLUMNS.map((column) => (
                        <SelectItem key={column.status} value={column.status}>{column.label}</SelectItem>
                      ))}
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
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((task) => task.status === column.status);
            return (
              <div key={column.status} className={`rounded-md border-t-4 bg-muted/20 p-2 ${column.accent}`}>
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-sm font-semibold">{column.label}</h3>
                  <span className="text-xs text-muted-foreground">{columnTasks.length}</span>
                </div>
                <Droppable droppableId={column.status}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[80px] space-y-2">
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, snapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`rounded-md border border-border bg-card p-3 text-sm shadow-sm ${snapshot.isDragging ? "ring-2 ring-accent" : ""}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <strong>{task.title}</strong>
                              </div>
                              {task.description && <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{task.description}</p>}
                              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                {task.discipline && <span>{task.discipline}</span>}
                                {task.dueAt && <span>Prazo: {new Date(task.dueAt).toLocaleDateString("pt-BR")}</span>}
                              </div>
                              <div className="mt-2 flex justify-end gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEdit(task)}>Editar</Button>
                                <Button size="sm" variant="destructive" onClick={() => remove(task)}>Excluir</Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {columnTasks.length === 0 && (
                        <p className="px-1 text-xs text-muted-foreground">Arraste tarefas para ca.</p>
                      )}
                    </div>
                  )}
                </Droppable>
                <Button variant="ghost" size="sm" className="mt-2 w-full" onClick={() => openCreate(column.status)}>
                  + tarefa
                </Button>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
