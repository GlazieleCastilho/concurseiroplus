"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePomodoroStore } from "@/stores/pomodoro-store";

const FASE_LABEL: Record<string, string> = {
  foco: "Foco",
  pausa_curta: "Pausa curta",
  pausa_longa: "Pausa longa",
};

export function PomodoroFloating() {
  const { fase, ativo, msRestantes, ciclosFeitos, posicao, minimizado, setPosicao, setMinimizado, iniciar, pausar, resetar, pular, tick } =
    usePomodoroStore();
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (!mounted || posicao) return;
    setPosicao({ x: window.innerWidth - 96, y: window.innerHeight - 120 });
  }, [mounted, posicao, setPosicao]);

  useEffect(() => {
    if (!dragging) return;
    function handleMove(event: PointerEvent) {
      const x = Math.min(Math.max(event.clientX - dragOffset.current.dx, 8), window.innerWidth - 64);
      const y = Math.min(Math.max(event.clientY - dragOffset.current.dy, 8), window.innerHeight - 64);
      setPosicao({ x, y });
    }
    function handleUp() {
      setDragging(false);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragging, setPosicao]);

  if (!mounted || !posicao) return null;

  const mm = String(Math.floor(msRestantes / 60_000)).padStart(2, "0");
  const ss = String(Math.floor((msRestantes % 60_000) / 1000)).padStart(2, "0");

  function startDrag(event: React.PointerEvent) {
    if (!posicao) return;
    dragOffset.current = { dx: event.clientX - posicao.x, dy: event.clientY - posicao.y };
    setDragging(true);
  }

  return (
    <div className="fixed z-50" style={{ left: posicao.x, top: posicao.y }}>
      {minimizado ? (
        <button
          type="button"
          onPointerDown={startDrag}
          onClick={() => !dragging && setMinimizado(false)}
          className="flex h-16 w-16 flex-col items-center justify-center rounded-full border border-border bg-card font-mono text-xs shadow-lg select-none touch-none"
          title="Pomodoro (arraste para mover, clique para abrir)"
        >
          <span className="text-[10px] uppercase text-muted-foreground">{ativo ? FASE_LABEL[fase] : "Pausado"}</span>
          <span className="font-bold">{mm}:{ss}</span>
        </button>
      ) : (
        <div className="w-56 rounded-lg border border-border bg-card p-3 shadow-xl">
          <div
            onPointerDown={startDrag}
            className="mb-2 flex cursor-move items-center justify-between select-none touch-none"
          >
            <span className="text-xs font-semibold uppercase text-muted-foreground">{FASE_LABEL[fase]}</span>
            <button type="button" onClick={() => setMinimizado(true)} className="text-xs text-muted-foreground hover:text-foreground">
              minimizar
            </button>
          </div>
          <p className="text-center font-mono text-3xl font-bold tabular-nums">{mm}:{ss}</p>
          <p className="mt-1 text-center text-xs text-muted-foreground">{ciclosFeitos} ciclos concluidos</p>
          <div className="mt-3 flex justify-center gap-2">
            <Button size="sm" onClick={ativo ? pausar : iniciar}>{ativo ? "Pausar" : "Iniciar"}</Button>
            <Button size="sm" variant="outline" onClick={() => resetar()}>Resetar</Button>
            <Button size="sm" variant="outline" onClick={() => pular()}>Pular</Button>
          </div>
        </div>
      )}
    </div>
  );
}
