"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LessonCommentNode } from "@/components/lessons/lesson-comment-node";
import type { LessonCommentItem } from "@/components/lessons/lesson-types";

export function LessonCommentThread({ lessonId, currentUserId }: { lessonId: string; currentUserId: string }) {
  const [comments, setComments] = useState<LessonCommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/lessons/${lessonId}/comments`)
      .then((res) => res.json())
      .then((data: { comments: LessonCommentItem[] }) => {
        if (!cancelled) setComments(data.comments ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao comentar");
      const { comment } = (await res.json()) as { comment: LessonCommentItem };
      setComments((prev) => [...prev, comment]);
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao comentar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva um comentario..."
          className="min-h-9 flex-1 resize-none text-sm"
          rows={1}
        />
        <Button type="submit" size="sm" disabled={sending || !content.trim()}>
          Comentar
        </Button>
      </form>
      {loading && <p className="text-sm text-muted-foreground">Carregando comentarios...</p>}
      {!loading && comments.length === 0 && <p className="text-sm text-muted-foreground">Nenhum comentario ainda.</p>}
      {comments.map((comment) => (
        <LessonCommentNode
          key={comment.id}
          comment={comment}
          lessonId={lessonId}
          currentUserId={currentUserId}
          depth={0}
          onChanged={(updater) => setComments(updater)}
        />
      ))}
    </div>
  );
}
