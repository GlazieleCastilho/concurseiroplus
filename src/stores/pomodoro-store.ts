import { create } from "zustand";
import { persist } from "zustand/middleware";

type Fase = "foco" | "pausa_curta" | "pausa_longa";

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
  iniciar: () => void;
  pausar: () => void;
  resetar: () => void;
  pular: () => void;
  tick: () => void;
};

const duracaoMs = (fase: Fase, config: Config) =>
  fase === "foco" ? config.focoMin * 60_000 : fase === "pausa_curta" ? config.pausaCurtaMin * 60_000 : config.pausaLongaMin * 60_000;

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      fase: "foco",
      ativo: false,
      ciclosFeitos: 0,
      msRestantes: 25 * 60_000,
      config: { focoMin: 25, pausaCurtaMin: 5, pausaLongaMin: 15, ciclosAteLonga: 4, autoAvancar: false },
      iniciar: () => set({ ativo: true }),
      pausar: () => set({ ativo: false }),
      resetar: () => set((state) => ({ ativo: false, msRestantes: duracaoMs(state.fase, state.config) })),
      pular: () => set((state) => {
        const ciclos = state.fase === "foco" ? state.ciclosFeitos + 1 : state.ciclosFeitos;
        const fase: Fase = state.fase !== "foco" ? "foco" : ciclos % state.config.ciclosAteLonga === 0 ? "pausa_longa" : "pausa_curta";
        return { fase, ciclosFeitos: ciclos, msRestantes: duracaoMs(fase, state.config), ativo: state.config.autoAvancar };
      }),
      tick: () => {
        const state = get();
        if (!state.ativo) return;
        if (state.msRestantes <= 1000) state.pular();
        else set({ msRestantes: state.msRestantes - 1000 });
      },
    }),
    { name: "concurseiro-pomodoro" }
  )
);
