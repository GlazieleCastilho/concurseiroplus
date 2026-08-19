"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CommentNode } from "@/components/feed/comment-node";
import type { FeedComment } from "@/components/feed/feed-types";

export function CommentThread({ postId, currentUserId }: { postId: string; currentUserId: string }) {
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/posts/${postId}/comments`)
      .then((res) => res.json())
      .then((data: { comments: FeedComment[] }) => {
        if (!cancelled) setComments(data.comments ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao comentar");
      const { comment } = (await res.json()) as { comment: FeedComment };
      setComments((prev) => [...prev, comment]);
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao comentar");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-3 border-t border-border pt-3">
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
        <CommentNode
          key={comment.id}
          comment={comment}
          postId={postId}
          currentUserId={currentUserId}
          depth={0}
          onChanged={(updater) => setComments(updater)}
        />
      ))}
    </div>
  );
}
