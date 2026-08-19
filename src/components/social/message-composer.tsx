"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function MessageComposer({ onSend, disabled }: { onSend: (content: string) => void; disabled?: boolean }) {
  const [value, setValue] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const content = value.trim();
    if (!content) return;
    onSend(content);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-border p-3">
      <Textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
          }
        }}
        placeholder="Escreva uma mensagem..."
        className="min-h-10 resize-none"
        rows={1}
        disabled={disabled}
      />
      <Button type="submit" disabled={disabled || !value.trim()}>
        Enviar
      </Button>
    </form>
  );
}
