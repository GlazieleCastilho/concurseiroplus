"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatUserName } from "@/lib/social-format";
import type { FeedComment } from "@/components/feed/feed-types";

export type CommentTreeUpdater = (updater: (tree: FeedComment[]) => FeedComment[]) => void;

function insertReply(tree: FeedComment[], parentId: string, reply: FeedComment): FeedComment[] {
  return tree.map((comment) =>
    comment.id === parentId
      ? { ...comment, replies: [...comment.replies, reply] }
      : { ...comment, replies: insertReply(comment.replies, parentId, reply) },
  );
}

function removeComment(tree: FeedComment[], commentId: string): FeedComment[] {
  return tree.filter((comment) => comment.id !== commentId).map((comment) => ({ ...comment, replies: removeComment(comment.replies, commentId) }));
}

export { insertReply, removeComment };

const INDENT_CLASSES = ["ml-0", "ml-4", "ml-8", "ml-12", "ml-16"] as const;

export function CommentNode({
  comment,
  postId,
  currentUserId,
  depth,
  onChanged,
}: {
  comment: FeedComment;
  postId: string;
  currentUserId: string;
  depth: number;
  onChanged: CommentTreeUpdater;
}) {
  const [liked, setLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const authorName = formatUserName(comment.user.firstName, comment.user.lastName);
  const indentClass = INDENT_CLASSES[Math.min(depth, 4)];

  async function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao curtir");
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      setLiked(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
      toast.error(error instanceof Error ? error.message : "Erro ao curtir");
    }
  }

  async function handleReply(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = replyContent.trim();
    if (!trimmed) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, parentId: comment.id }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao responder");
      const { comment: reply } = (await res.json()) as { comment: FeedComment };
      onChanged((tree) => insertReply(tree, comment.id, reply));
      setReplyContent("");
      setReplying(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao responder");
    } finally {
      setSendingReply(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments/${comment.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao excluir comentario");
      onChanged((tree) => removeComment(tree, comment.id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir comentario");
      setDeleting(false);
    }
  }

  return (
    <div className={`space-y-2 ${depth > 0 ? indentClass : ""}`}>
      <div className="flex items-start gap-2">
        <Avatar className="size-7">
          <AvatarImage src={comment.user.imageUrl ?? undefined} />
          <AvatarFallback>{authorName[0] ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-md bg-muted px-3 py-2 text-sm">
          <p className="font-semibold">{authorName}</p>
          <p className="whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
      <div className="ml-9 flex items-center gap-3 text-xs text-muted-foreground">
        <button type="button" onClick={toggleLike} className={liked ? "font-semibold text-foreground" : ""}>
          Curtir {likeCount > 0 && `(${likeCount})`}
        </button>
        <button type="button" onClick={() => setReplying((prev) => !prev)}>
          Responder
        </button>
        {comment.userId === currentUserId && (
          <button type="button" onClick={handleDelete} disabled={deleting}>
            Excluir
          </button>
        )}
      </div>
      {replying && (
        <form onSubmit={handleReply} className="ml-9 flex items-end gap-2">
          <Textarea
            value={replyContent}
            onChange={(event) => setReplyContent(event.target.value)}
            placeholder="Escreva uma resposta..."
            className="min-h-9 flex-1 resize-none text-sm"
            rows={1}
          />
          <Button type="submit" size="sm" disabled={sendingReply || !replyContent.trim()}>
            Enviar
          </Button>
        </form>
      )}
      {comment.replies.map((reply) => (
        <CommentNode key={reply.id} comment={reply} postId={postId} currentUserId={currentUserId} depth={depth + 1} onChanged={onChanged} />
      ))}
    </div>
  );
}
