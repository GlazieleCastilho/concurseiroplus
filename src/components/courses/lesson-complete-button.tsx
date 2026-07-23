"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LessonCompleteButton({
  courseId,
  lessonId,
  initialCompleted,
}: {
  courseId: string;
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    setLoading(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/lessons/${lessonId}/progress`, {
        method: completed ? "DELETE" : "POST",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error ?? "Erro ao atualizar progresso");
      setCompleted(!completed);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar progresso");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={toggle} disabled={loading} variant={completed ? "outline" : "default"}>
      {loading ? "Salvando..." : completed ? "Concluida ✓ (desmarcar)" : "Marcar como concluida"}
    </Button>
  );
}
