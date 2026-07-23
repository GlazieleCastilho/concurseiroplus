import { create } from "zustand";
import { persist } from "zustand/middleware";
import { playAlarmSound, unlockAlarmAudio } from "@/lib/alarm-sound";

type Fase = "foco" | "pausa_curta" | "pausa_longa";

type Posicao = { x: number; y: number };

const FASE_TO_TIPO: Record<Fase, "FOCO" | "PAUSA_CURTA" | "PAUSA_LONGA"> = {
  foco: "FOCO",
  pausa_curta: "PAUSA_CURTA",
  pausa_longa: "PAUSA_LONGA",
};

type Config = {
  focoMin: number;
  pausaCurtaMin: number;
  pausaLongaMin: number;
  ciclosAteLonga: number;
  autoAvancar: boolean;
};

type PomodoroState = {
  fase: Fase;
  ativo: boolean;
  ciclosFeitos: number;
  msRestantes: number;
  config: Config;
  plannerTaskId: string | null;
  faseIniciadaEm: number | null;
  posicao: Posicao | null;
  minimizado: boolean;
  setPlannerTaskId: (id: string | null) => void;
  setPosicao: (posicao: Posicao) => void;
  setMinimizado: (minimizado: boolean) => void;
  iniciar: () => void;
  pausar: () => void;
  resetar: () => void;
  pular: (completadoNaturalmente?: boolean) => void;
  tick: () => void;
};

const duracaoMs = (fase: Fase, config: Config) =>
  fase === "foco" ? config.focoMin * 60_000 : fase === "pausa_curta" ? config.pausaCurtaMin * 60_000 : config.pausaLongaMin * 60_000;

function registrarSessao(state: PomodoroState, completado: boolean) {
  if (!state.faseIniciadaEm) return;
  const startedAt = new Date(state.faseIniciadaEm);
  const endedAt = new Date();
  const duracaoMin = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60_000));
  void fetch("/api/pomodoro", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      tipo: FASE_TO_TIPO[state.fase],
      duracaoMin,
      completado,
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      plannerTaskId: state.plannerTaskId ?? undefined,
    }),
  }).catch(() => {});
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      fase: "foco",
      ativo: false,
      ciclosFeitos: 0,
      msRestantes: 25 * 60_000,
      config: { focoMin: 25, pausaCurtaMin: 5, pausaLongaMin: 15, ciclosAteLonga: 4, autoAvancar: false },
      plannerTaskId: null,
      faseIniciadaEm: null,
      posicao: null,
      minimizado: true,
      setPlannerTaskId: (id) => set({ plannerTaskId: id }),
      setPosicao: (posicao) => set({ posicao }),
      setMinimizado: (minimizado) => set({ minimizado }),
      iniciar: () => {
        unlockAlarmAudio();
        set((state) => ({ ativo: true, faseIniciadaEm: state.faseIniciadaEm ?? Date.now() }));
      },
      pausar: () => set({ ativo: false }),
      resetar: () =>
        set((state) => {
          if (state.faseIniciadaEm) registrarSessao(state, false);
          return { ativo: false, msRestantes: duracaoMs(state.fase, state.config), faseIniciadaEm: null };
        }),
      pular: (completadoNaturalmente = false) =>
        set((state) => {
          if (state.faseIniciadaEm) registrarSessao(state, completadoNaturalmente);
          if (completadoNaturalmente) playAlarmSound();
          const ciclos = state.fase === "foco" ? state.ciclosFeitos + 1 : state.ciclosFeitos;
          const fase: Fase = state.fase !== "foco" ? "foco" : ciclos % state.config.ciclosAteLonga === 0 ? "pausa_longa" : "pausa_curta";
          const ativo = state.config.autoAvancar;
          return {
            fase,
            ciclosFeitos: ciclos,
            msRestantes: duracaoMs(fase, state.config),
            ativo,
            faseIniciadaEm: ativo ? Date.now() : null,
          };
        }),
      tick: () => {
        const state = get();
        if (!state.ativo) return;
        if (state.msRestantes <= 1000) state.pular(true);
        else set({ msRestantes: state.msRestantes - 1000 });
      },
    }),
    { name: "concurseiro-pomodoro", partialize: (state) => ({ ...state, faseIniciadaEm: null, ativo: false }) }
  )
);
