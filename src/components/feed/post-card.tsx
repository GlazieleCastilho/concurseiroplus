"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatUserName } from "@/lib/social-format";
import { CommentThread } from "@/components/feed/comment-thread";
import type { FeedPost } from "@/components/feed/feed-types";

export function PostCard({
  post,
  currentUserId,
  onDeleted,
}: {
  post: FeedPost;
  currentUserId: string;
  onDeleted: (postId: string) => void;
}) {
  const [liked, setLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [liking, setLiking] = useState(false);

  const authorName = formatUserName(post.user.firstName, post.user.lastName);

  async function toggleLike() {
    if (liking) return;
    setLiking(true);
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev) => prev + (nextLiked ? 1 : -1));
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao curtir");
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      setLiked(!nextLiked);
      setLikeCount((prev) => prev + (nextLiked ? -1 : 1));
      toast.error(error instanceof Error ? error.message : "Erro ao curtir");
    } finally {
      setLiking(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao excluir postagem");
      onDeleted(post.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao excluir postagem");
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src={post.user.imageUrl ?? undefined} />
              <AvatarFallback>{authorName[0] ?? "?"}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-base">{authorName}</CardTitle>
          </div>
          {post.userId === currentUserId && (
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting}>
              Excluir
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="whitespace-pre-wrap">{post.content}</p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <button type="button" onClick={toggleLike} disabled={liking} className={liked ? "font-semibold text-foreground" : ""}>
            {likeCount} curtidas
          </button>
          <button type="button" onClick={() => setExpanded((prev) => !prev)}>
            {post.commentCount} comentarios
          </button>
        </div>
        {expanded && <CommentThread postId={post.id} currentUserId={currentUserId} />}
      </CardContent>
    </Card>
  );
}
