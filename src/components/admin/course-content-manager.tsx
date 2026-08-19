"use client";

import { useState } from "react";
import { Reorder } from "framer-motion";
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
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { CourseLesson, CourseModule } from "@/generated/prisma";

type ModuleWithLessons = CourseModule & { lessons: CourseLesson[] };

type ModuleFormState = { title: string; description: string; order: string };
type LessonFormState = {
  title: string;
  description: string;
  videoSource: "YOUTUBE" | "UPLOAD";
  videoId: string;
  videoUrl: string;
  attachmentUrl: string;
  attachmentName: string;
  durationMin: string;
  order: string;
};

const emptyModuleForm: ModuleFormState = { title: "", description: "", order: "1" };
const emptyLessonForm: LessonFormState = {
  title: "",
  description: "",
  videoSource: "YOUTUBE",
  videoId: "",
  videoUrl: "",
  attachmentUrl: "",
  attachmentName: "",
  durationMin: "10",
  order: "1",
};

export function CourseContentManager({ courseId, initialModules }: { courseId: string; initialModules: ModuleWithLessons[] }) {
  const [modules, setModules] = useState([...initialModules].sort((a, b) => a.order - b.order));

  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);
  const [moduleForm, setModuleForm] = useState<ModuleFormState>(emptyModuleForm);
  const [savingModule, setSavingModule] = useState(false);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonModuleId, setLessonModuleId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [lessonForm, setLessonForm] = useState<LessonFormState>(emptyLessonForm);
  const [savingLesson, setSavingLesson] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);

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

  async function handleModulesReorder(newOrder: ModuleWithLessons[]) {
    setModules(newOrder);
    try {
      const response = await fetch("/api/admin/course-modules/reorder", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ courseId, orderedIds: newOrder.map((module) => module.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao reordenar modulos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao reordenar modulos");
    }
  }

  async function handleLessonsReorder(moduleId: string, newLessons: CourseLesson[]) {
    setModules((current) => current.map((module) => (module.id === moduleId ? { ...module, lessons: newLessons } : module)));
    try {
      const response = await fetch("/api/admin/course-lessons/reorder", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moduleId, orderedIds: newLessons.map((lesson) => lesson.id) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao reordenar aulas");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao reordenar aulas");
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
      videoSource: lesson.videoSource,
      videoId: lesson.videoId ?? "",
      videoUrl: lesson.videoUrl ?? "",
      attachmentUrl: lesson.attachmentUrl ?? "",
      attachmentName: lesson.attachmentName ?? "",
      durationMin: String(Math.round(lesson.durationInMs / 60_000)),
      order: String(lesson.order),
    });
    setLessonDialogOpen(true);
  }

  async function handleVideoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const signResponse = await fetch("/api/admin/uploads/course-video/sign", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      });
      const target = await signResponse.json();
      if (!signResponse.ok) throw new Error(target.error ?? "Erro ao preparar upload");
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.storage.from(target.bucket).uploadToSignedUrl(target.path, target.token, file);
      if (error) throw new Error(error.message);
      setLessonForm((current) => ({ ...current, videoUrl: target.publicUrl, videoSource: "UPLOAD" }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao subir video");
    } finally {
      setUploadingVideo(false);
      event.target.value = "";
    }
  }

  async function handleAttachmentUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadingAttachment(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/uploads/course-attachment", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao subir material");
      setLessonForm((current) => ({ ...current, attachmentUrl: data.url, attachmentName: data.name }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao subir material");
    } finally {
      setUploadingAttachment(false);
      event.target.value = "";
    }
  }

  async function saveLesson() {
    if (!lessonModuleId) return;
    setSavingLesson(true);
    try {
      const payload = {
        title: lessonForm.title,
        description: lessonForm.description || undefined,
        videoSource: lessonForm.videoSource,
        videoId: lessonForm.videoSource === "YOUTUBE" ? lessonForm.videoId || undefined : undefined,
        videoUrl: lessonForm.videoSource === "UPLOAD" ? lessonForm.videoUrl || undefined : undefined,
        attachmentUrl: lessonForm.attachmentUrl || undefined,
        attachmentName: lessonForm.attachmentName || undefined,
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModuleDialogOpen(false)}>Cancelar</Button>
              <Button onClick={saveModule} disabled={savingModule || !moduleForm.title}>{savingModule ? "Salvando..." : "Salvar"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={lessonDialogOpen} onOpenChange={setLessonDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
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

            <div className="space-y-2">
              <Label>Video</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={lessonForm.videoSource === "YOUTUBE" ? "default" : "outline"}
                  onClick={() => setLessonForm({ ...lessonForm, videoSource: "YOUTUBE" })}
                >
                  YouTube
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={lessonForm.videoSource === "UPLOAD" ? "default" : "outline"}
                  onClick={() => setLessonForm({ ...lessonForm, videoSource: "UPLOAD" })}
                >
                  Upload de video
                </Button>
              </div>
              {lessonForm.videoSource === "YOUTUBE" ? (
                <Input
                  value={lessonForm.videoId}
                  onChange={(event) => setLessonForm({ ...lessonForm, videoId: event.target.value })}
                  placeholder="Ex: dQw4w9WgXcQ (o trecho depois de v= na URL)"
                />
              ) : (
                <div className="space-y-1">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={uploadingVideo}
                    onChange={handleVideoUpload}
                    className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm"
                  />
                  {uploadingVideo && <p className="text-xs text-muted-foreground">Enviando video...</p>}
                  {lessonForm.videoUrl && !uploadingVideo && <p className="text-xs text-muted-foreground">Video enviado.</p>}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Material em PDF (opcional)</Label>
              <input
                type="file"
                accept="application/pdf"
                disabled={uploadingAttachment}
                onChange={handleAttachmentUpload}
                className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm"
              />
              {uploadingAttachment && <p className="text-xs text-muted-foreground">Enviando...</p>}
              {lessonForm.attachmentName && !uploadingAttachment && <p className="text-xs text-muted-foreground">{lessonForm.attachmentName}</p>}
            </div>

            <div className="space-y-1">
              <Label>Duracao (min)</Label>
              <Input type="number" value={lessonForm.durationMin} onChange={(event) => setLessonForm({ ...lessonForm, durationMin: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLessonDialogOpen(false)}>Cancelar</Button>
            <Button onClick={saveLesson} disabled={savingLesson || uploadingVideo || uploadingAttachment || !lessonForm.title}>
              {savingLesson ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {modules.length === 0 && <p className="text-sm text-muted-foreground">Nenhum modulo cadastrado ainda.</p>}

      <Reorder.Group axis="y" values={modules} onReorder={handleModulesReorder} className="space-y-3">
        {modules.map((module) => (
          <Reorder.Item key={module.id} value={module} className="cursor-grab rounded-md border border-border bg-background p-3 active:cursor-grabbing">
            <div className="flex items-center justify-between gap-2">
              <div>
                <strong>{module.title}</strong>
                {module.description && <p className="text-sm text-muted-foreground">{module.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEditModule(module)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => removeModule(module)}>Excluir</Button>
              </div>
            </div>
            <div className="mt-3 space-y-2 border-t border-border pt-3">
              <Reorder.Group
                axis="y"
                values={module.lessons}
                onReorder={(newLessons) => handleLessonsReorder(module.id, newLessons)}
                className="space-y-2"
              >
                {module.lessons.map((lesson) => (
                  <Reorder.Item
                    key={lesson.id}
                    value={lesson}
                    className="flex cursor-grab items-center justify-between gap-2 rounded-md bg-muted/30 p-2 text-sm active:cursor-grabbing"
                  >
                    <div>
                      <span className="font-medium">{lesson.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {Math.round(lesson.durationInMs / 60_000)} min ·{" "}
                        {lesson.videoSource === "UPLOAD" && lesson.videoUrl
                          ? "video enviado"
                          : lesson.videoId
                            ? "video YouTube"
                            : "sem video"}
                        {lesson.attachmentUrl ? " · PDF" : ""}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditLesson(module.id, lesson)}>Editar</Button>
                      <Button size="sm" variant="destructive" onClick={() => removeLesson(module.id, lesson)}>Excluir</Button>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              {module.lessons.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma aula neste modulo.</p>}
              <Button size="sm" variant="ghost" onClick={() => openCreateLesson(module.id)}>+ Nova aula</Button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
