"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PostComposer } from "@/components/feed/post-composer";
import { PostCard } from "@/components/feed/post-card";
import type { FeedPost } from "@/components/feed/feed-types";

export function FeedList({ initialPosts, currentUserId }: { initialPosts: FeedPost[]; currentUserId: string }) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);

  return (
    <div className="grid gap-4">
      <PostComposer onCreated={(post) => setPosts((prev) => [post, ...prev])} />
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUserId={currentUserId}
          onDeleted={(postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))}
        />
      ))}
      {posts.length === 0 && (
        <Card>
          <CardContent className="pt-0 text-sm text-muted-foreground">Nenhuma postagem ainda.</CardContent>
        </Card>
      )}
    </div>
  );
}
