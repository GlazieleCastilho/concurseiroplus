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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Course, CourseDifficulty, CourseStatus, PlanTier } from "@/generated/prisma";

type CourseWithCount = Course & { _count: { modules: number } };

type CourseFormState = {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  price: string;
  discountPrice: string;
  status: CourseStatus;
  difficulty: CourseDifficulty;
  requiredTier: PlanTier;
};

const emptyForm: CourseFormState = {
  title: "",
  slug: "",
  description: "",
  shortDescription: "",
  thumbnail: "",
  price: "0",
  discountPrice: "",
  status: "DRAFT",
  difficulty: "MEDIUM",
  requiredTier: "ESSENCIAL",
};

const STATUS_LABELS: Record<CourseStatus, string> = { DRAFT: "Rascunho", PUBLISHED: "Publicado", ARCHIVED: "Arquivado" };
const STATUS_BADGE_CLASS: Record<CourseStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-green-500/15 text-green-500",
  ARCHIVED: "bg-red-500/15 text-red-500",
};

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CourseManager({ initialCourses }: { initialCourses: CourseWithCount[] }) {
  const router = useRouter();
  const [courses, setCourses] = useState(initialCourses);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseWithCount | null>(null);
  const [form, setForm] = useState<CourseFormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(course: CourseWithCount) {
    setEditing(course);
    setForm({
      title: course.title,
      slug: course.slug,
      description: course.description,
      shortDescription: course.shortDescription ?? "",
      thumbnail: course.thumbnail,
      price: String(course.price),
      discountPrice: course.discountPrice != null ? String(course.discountPrice) : "",
      status: course.status,
      difficulty: course.difficulty,
      requiredTier: course.requiredTier,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        thumbnail: form.thumbnail,
        price: Number(form.price) || 0,
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        status: form.status,
        difficulty: form.difficulty,
        requiredTier: form.requiredTier,
      };
      const response = await fetch(editing ? `/api/admin/courses/${editing.id}` : "/api/admin/courses", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar curso");
      toast.success(editing ? "Curso atualizado." : "Curso criado.");
      setOpen(false);
      router.refresh();
      if (!editing) {
        setCourses((current) => [{ ...data.course, _count: { modules: 0 } }, ...current]);
      } else {
        setCourses((current) => current.map((item) => (item.id === data.course.id ? { ...item, ...data.course } : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar curso");
    } finally {
      setSaving(false);
    }
  }

  async function remove(course: CourseWithCount) {
    if (!confirm(`Excluir o curso "${course.title}" e todos os seus modulos/aulas?`)) return;
    try {
      const response = await fetch(`/api/admin/courses/${course.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir curso");
      toast.success("Curso excluido.");
      setCourses((current) => current.filter((item) => item.id !== course.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir curso");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>+ Novo curso</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar curso" : "Novo curso"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Titulo</Label>
                <Input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value, slug: editing ? form.slug : slugify(event.target.value) })}
                  placeholder="Direito Constitucional Essencial"
                />
              </div>
              <div className="space-y-1">
                <Label>Slug (URL)</Label>
                <Input value={form.slug} onChange={(event) => setForm({ ...form, slug: slugify(event.target.value) })} placeholder="direito-constitucional-essencial" />
              </div>
              <div className="space-y-1">
                <Label>Descricao curta</Label>
                <Input value={form.shortDescription} onChange={(event) => setForm({ ...form, shortDescription: event.target.value })} placeholder="Aparece nos cards da listagem" />
              </div>
              <div className="space-y-1">
                <Label>Descricao completa</Label>
                <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>URL da capa (thumbnail)</Label>
                <Input value={form.thumbnail} onChange={(event) => setForm({ ...form, thumbnail: event.target.value })} placeholder="https://..." />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Preco (R$)</Label>
                  <Input type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Preco com desconto (opcional)</Label>
                  <Input type="number" value={form.discountPrice} onChange={(event) => setForm({ ...form, discountPrice: event.target.value })} />
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as CourseStatus })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Rascunho</SelectItem>
                      <SelectItem value="PUBLISHED">Publicado</SelectItem>
                      <SelectItem value="ARCHIVED">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Dificuldade</Label>
                  <Select value={form.difficulty} onValueChange={(value) => setForm({ ...form, difficulty: value as CourseDifficulty })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Facil</SelectItem>
                      <SelectItem value="MEDIUM">Media</SelectItem>
                      <SelectItem value="HARD">Dificil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Plano minimo exigido</Label>
                  <Select value={form.requiredTier} onValueChange={(value) => setForm({ ...form, requiredTier: value as PlanTier })}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ESSENCIAL">Essencial</SelectItem>
                      <SelectItem value="PRO">Pro</SelectItem>
                      <SelectItem value="ELITE">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving || !form.title || !form.slug || !form.description || !form.thumbnail}>
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
            <TableHead>Status</TableHead>
            <TableHead>Plano</TableHead>
            <TableHead>Modulos</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.id}>
              <TableCell className="max-w-[240px] truncate font-medium">{course.title}</TableCell>
              <TableCell>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[course.status]}`}>{STATUS_LABELS[course.status]}</span>
              </TableCell>
              <TableCell>{course.requiredTier}</TableCell>
              <TableCell>{course._count.modules}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Link href={`/admin/courses/${course.id}`}>
                  <Button size="sm" variant="outline">Conteudo</Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => openEdit(course)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(course)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {courses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">Nenhum curso cadastrado ainda.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
