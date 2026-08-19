"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { FeedPost } from "@/components/feed/feed-types";

export function PostComposer({ onCreated }: { onCreated: (post: FeedPost) => void }) {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (trimmed.length < 3) return;
    setSaving(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao publicar");
      const { post } = (await res.json()) as { post: FeedPost };
      onCreated(post);
      setContent("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao publicar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="O que voce quer compartilhar?"
            className="min-h-20"
            maxLength={2400}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || content.trim().length < 3}>
              {saving ? "Publicando..." : "Publicar"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
