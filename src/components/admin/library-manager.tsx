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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { LibraryDocument } from "@/generated/prisma";

type DocumentFormState = {
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
};

const emptyForm: DocumentFormState = { title: "", description: "", category: "", fileUrl: "", fileName: "" };

export function LibraryManager({ initialDocuments }: { initialDocuments: LibraryDocument[] }) {
  const [documents, setDocuments] = useState(initialDocuments);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<LibraryDocument | null>(null);
  const [form, setForm] = useState<DocumentFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/uploads/library-document", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao subir PDF");
      setForm((current) => ({ ...current, fileUrl: data.url, fileName: data.name }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao subir PDF");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(document: LibraryDocument) {
    setEditing(document);
    setForm({
      title: document.title,
      description: document.description ?? "",
      category: document.category,
      fileUrl: document.fileUrl,
      fileName: document.fileName,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || undefined,
        category: form.category,
        fileUrl: form.fileUrl,
        fileName: form.fileName,
      };
      const response = await fetch(editing ? `/api/admin/library/${editing.id}` : "/api/admin/library", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao salvar documento");
      toast.success(editing ? "Documento atualizado." : "Documento criado.");
      setOpen(false);
      if (!editing) {
        setDocuments((current) => [data.document, ...current]);
      } else {
        setDocuments((current) => current.map((item) => (item.id === data.document.id ? data.document : item)));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar documento");
    } finally {
      setSaving(false);
    }
  }

  async function remove(document: LibraryDocument) {
    if (!confirm(`Excluir o documento "${document.title}"?`)) return;
    try {
      const response = await fetch(`/api/admin/library/${document.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Erro ao excluir documento");
      toast.success("Documento excluido.");
      setDocuments((current) => current.filter((item) => item.id !== document.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir documento");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate}>+ Novo documento</Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar documento" : "Novo documento"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Titulo</Label>
                <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Resumo de Direito Constitucional" />
              </div>
              <div className="space-y-1">
                <Label>Categoria / disciplina</Label>
                <Input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Direito Constitucional" />
              </div>
              <div className="space-y-1">
                <Label>Descricao (opcional)</Label>
                <Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Arquivo PDF</Label>
                {form.fileName && <p className="text-xs text-muted-foreground">{form.fileName}</p>}
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={uploading}
                  onChange={handleFileChange}
                  className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border file:border-border file:bg-background file:px-3 file:py-1.5 file:text-sm"
                />
                {uploading && <p className="text-xs text-muted-foreground">Enviando...</p>}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save} disabled={saving || uploading || !form.title || !form.category || !form.fileUrl}>
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
            <TableHead>Categoria</TableHead>
            <TableHead className="text-right">Acoes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id}>
              <TableCell className="max-w-[280px] truncate font-medium">{document.title}</TableCell>
              <TableCell>{document.category}</TableCell>
              <TableCell className="flex justify-end gap-2 text-right">
                <Button size="sm" variant="outline" onClick={() => openEdit(document)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(document)}>Excluir</Button>
              </TableCell>
            </TableRow>
          ))}
          {documents.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">Nenhum documento cadastrado ainda.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
