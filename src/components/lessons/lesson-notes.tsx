"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

type SaveState = "idle" | "saving" | "saved";

export function LessonNotes({ lessonId, initialContent }: { lessonId: string; initialContent: string }) {
  const [content, setContent] = useState(initialContent);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setSaveState("saving");
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/lessons/${lessonId}/notes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error((await res.json()).error ?? "Erro ao salvar anotacao");
        setSaveState("saved");
      } catch (error) {
        setSaveState("idle");
        toast.error(error instanceof Error ? error.message : "Erro ao salvar anotacao");
      }
    }, 1000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  return (
    <div className="space-y-2">
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Escreva suas anotacoes sobre esta aula..."
        className="min-h-32"
        maxLength={10000}
      />
      <p className="text-xs text-muted-foreground">
        {saveState === "saving" && "Salvando..."}
        {saveState === "saved" && "Salvo"}
      </p>
    </div>
  );
}
