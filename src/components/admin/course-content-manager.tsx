"use client";

import { useState } from "react";
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
import type { CourseLesson, CourseModule } from "@/generated/prisma";

type ModuleWithLessons = CourseModule & { lessons: CourseLesson[] };

type ModuleFormState = { title: string; description: string; order: string };
type LessonFormState = { title: string; description: string; videoId: string; durationMin: string; order: string };

const emptyModuleForm: ModuleFormState = { title: "", description: "", order: "1" };
const emptyLessonForm: LessonFormState = { title: "", description: "", videoId: "", durationMin: "10", order: "1" };

export function CourseContentManager({ courseId, initialModules }: { courseId: string; initialModules: ModuleWithLessons[] }) {
  const [modules, setModules] = useState(initialModules);

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(emptyModuleForm);
  const [savingModule, setSavingModule] = useState(false);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm);
  const [savingLesson, setSavingLesson] = useState(false);

  function openCreateModule() {
    setEditingModule(null);
    setModuleForm({ title: "", description: "", order: String(modules.length + 1) });
    setModuleDialogOpen(true);
  }

  function openEditModule(module: CourseModule) {
    setEditingModule(module);
    setModuleForm({ title: module.title, description: module.description ?? "", order: String(module.order) });
    setModuleDialogOpen(true);
  }

  async function saveModule() {
    setSavingModule(true);
    try {
      const payload = {
        title: moduleForm.title,
        description: moduleForm.description || undefined,
        order: Number(moduleForm.order) || 1,
      };
      const response = await fetch(
        editingModule ? `/api/admin/course-modules/${editingModule.id}` : "/api/admin/course-modules",
        {
          method: editingModule ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(editingModule ? payload : { ...payload, courseId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar modulo");
      toast.success(editingModule ? "Modulo atualizado." : "Modulo criado.");
      setModuleDialogOpen(false);
      if (editingModule) {
        setModules((current) => current.map((item) => (item.id === data.module.id ? { ...item, ...data.module } : item)));
      } else {
        setModules((current) => [...current, { ...data.module, lessons: [] }]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar modulo");
    } finally {
      setSavingModule(false);
    }
  }

  async function removeModule(module: CourseModule) {
    if (!confirm(`Excluir o modulo "${module.title}" e todas as suas aulas?`)) return;
    try {
      const response = await fetch(`/api/admin/course-modules/${module.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir modulo");
      toast.success("Modulo excluido.");
      setModules((current) => current.filter((item) => item.id !== module.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir modulo");
    }
  }

  function openCreateLesson(moduleId: string) {
    const targetModule = modules.find((item) => item.id === moduleId);
    setEditingLesson(null);
    setLessonModuleId(moduleId);
    setLessonForm({ ...emptyLessonForm, order: String((targetModule?.lessons.length ?? 0) + 1) });
    setLessonDialogOpen(true);
  }

  function openEditLesson(moduleId: string, lesson: CourseLesson) {
    setEditingLesson(lesson);
    setLessonModuleId(moduleId);
    setLessonForm({
      title: lesson.title,
      description: lesson.description ?? "",
      videoId: lesson.videoId ?? "",
      durationMin: String(Math.round(lesson.durationInMs / 60_000)),
      order: String(lesson.order),
    });
    setLessonDialogOpen(true);
  }

  async function saveLesson() {
    if (!lessonModuleId) return;
    setSavingLesson(true);
    try {
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        videoId: lessonForm.videoId || undefined,
        durationInMs: (Number(lessonForm.durationMin) || 0) * 60_000,
        order: Number(lessonForm.order) || 1,
      };
      const response = await fetch(
        editingLesson ? `/api/admin/course-lessons/${editingLesson.id}` : "/api/admin/course-lessons",
        {
          method: editingLesson ? "PATCH" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(editingLesson ? payload : { ...payload, moduleId: lessonModuleId }),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar aula");
      toast.success(editingLesson ? "Aula atualizada." : "Aula criada.");
      setLessonDialogOpen(false);
      setModules((current) =>
        current.map((module) => {
          if (module.id !== lessonModuleId) return module;
          if (editingLesson) {
            return { ...module, lessons: module.lessons.map((lesson) => (lesson.id === data.lesson.id ? data.lesson : lesson)) };
          }
          return { ...module, lessons: [...module.lessons, data.lesson] };
        })
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar aula");
    } finally {
      setSavingLesson(false);
    }
  }

  async function removeLesson(moduleId: string, lesson: CourseLesson) {
    if (!confirm(`Excluir a aula "${lesson.title}"?`)) return;
    try {
      const response = await fetch(`/api/admin/course-lessons/${lesson.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir aula");
      toast.success("Aula excluida.");
      setModules((current) =>
        current.map((module) => (module.id === moduleId ? { ...module, lessons: module.lessons.filter((item) => item.id !== lesson.id) } : module))
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir aula");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateModule}>+ Novo modulo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingModule ? "Editar modulo" : "Novo modulo"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Titulo</Label>
                <Input value={moduleForm.title} onChange={(event) => setModuleForm({ ...moduleForm, title: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Descricao</Label>
                <Textarea value={moduleForm.description} onChange={(event) => setModuleForm({ ...moduleForm, description: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Ordem</Label>
                <Input type="number" value={moduleForm.order} onChange={(event) => setModuleForm({ ...moduleForm, order: event.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancelar</Button>
              <Button onClick={saveModule} disabled={savingModule || !moduleForm.title}>{savingModule ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingLesson ? "Editar aula" : "Nova aula"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Titulo</Label>
              <Input value={lessonForm.title} onChange={(event) => setLessonForm({ ...lessonForm, title: event.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Descricao</Label>
              <Textarea value={lessonForm.description} onChange={(event) => setLessonForm({ ...lessonForm, description: event.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>ID do video no YouTube</Label>
              <Input
                value={lessonForm.videoId}
                onChange={(event) => setLessonForm({ ...lessonForm, videoId: event.target.value })}
                placeholder="Ex: dQw4w9WgXcQ (o trecho depois de v= na URL)"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Duracao (min)</Label>
                <Input type="number" value={lessonForm.durationMin} onChange={(event) => setLessonForm({ ...lessonForm, durationMin: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Ordem</Label>
                <Input type="number" value={lessonForm.order} onChange={(event) => setLessonForm({ ...lessonForm, order: event.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveLesson} disabled={savingLesson || !lessonForm.title}>{savingLesson ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhum modulo cadastrado ainda.</p>}

      <div className="space-y-3">
        {[...modules].sort((a, b) => a.order - b.order).map((module) => (
          <div key={module.id} className="rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <strong>{module.order}. {module.title}</strong>
                {module.description && <p className="text-sm text-muted-foreground">{module.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModule(module)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => removeModule(module)}>Excluir</Button>
              </div>
            </div>
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              {[...module.lessons].sort((a, b) => a.order - b.order).map((lesson) => (
                <div key={lesson.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/30 p-2 text-sm">
                  <div>
                    <span className="font-medium">{lesson.order}. {lesson.title}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {Math.round(lesson.durationInMs / 60_000)} min {lesson.videoId ? "· video ok" : "· sem video"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEditLesson(module.id, lesson)}>Editar</Button>
                    <Button size="sm" variant="destructive" onClick={() => removeLesson(module.id, lesson)}>Excluir</Button>
                  </div>
                </div>
              ))}
              {module.lessons.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma aula neste modulo.</p>}
              <Button size="sm" variant="ghost" onClick={() => openCreateLesson(module.id)}>+ Nova aula</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
