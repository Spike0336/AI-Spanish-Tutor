import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, GoalId, LevelId, TutorId, Word } from "@/lib/catalog";
import { dayKey, shiftDay } from "@/lib/days";
import { SCENE_GOAL } from "@/lib/catalog";

export type Profile = {
  name: string;
  level: LevelId;
  goal: GoalId;
  tutorId: TutorId;
  showGloss: boolean;
  voiceOn: boolean;
  onboarded: boolean;
  introStep: number;
};

type Progress = {
  xp: number;
  streak: number;
  lastPracticeDate: string | null;
  practiceDates: string[];
  repsToday: number;
  repsDate: string | null;
  drillsToday: string[];
  drillsDate: string | null;
  drillsCleared: string[];
  totalTurns: number;
  cleanTurns: number;
  bestPronounce: number;
  completedScenarios: string[];
  scenarioTurns: Record<string, number>;
  words: Word[];
  threads: Record<string, ChatMessage[]>;
  lastScenarioId: string | null;
};

type Session = {
  pendingScenario: string | null;
  turnError: string | null;
  turnErrorCode: "credits" | "unavailable" | null;
  aiPaused: boolean;
};

type Actions = {
  patchProfile: (patch: Partial<Profile>) => void;
  appendUser: (scenarioId: string, message: ChatMessage) => void;
  recordTutorReply: (scenarioId: string, message: ChatMessage, clean: boolean) => void;
  recordDrill: (phraseId: string, score: number) => void;
  setPending: (scenarioId: string | null) => void;
  setTurnError: (error: string | null, code?: "credits" | "unavailable" | null) => void;
  setAiPaused: (paused: boolean) => void;
  resetProgress: () => void;
};

const progressDefaults: Progress = {
  xp: 0,
  streak: 0,
  lastPracticeDate: null,
  practiceDates: [],
  repsToday: 0,
  repsDate: null,
  drillsToday: [],
  drillsDate: null,
  drillsCleared: [],
  totalTurns: 0,
  cleanTurns: 0,
  bestPronounce: 0,
  completedScenarios: [],
  scenarioTurns: {},
  words: [],
  threads: {},
  lastScenarioId: null,
};

function touchPractice(state: Progress) {
  const today = dayKey();
  const yesterday = shiftDay(today, -1);
  const already = state.lastPracticeDate === today;
  const streak = already ? state.streak : state.lastPracticeDate === yesterday ? state.streak + 1 : 1;
  const practiceDates = already
    ? state.practiceDates
    : [...state.practiceDates.filter((day) => day !== today), today].slice(-30);
  const repsToday = state.repsDate === today ? state.repsToday : 0;
  return { today, streak, practiceDates, repsToday, lastPracticeDate: today };
}

function mergeWords(existing: Word[], incoming: Word[]) {
  const map = new Map<string, Word>();
  for (const word of existing) map.set(word.es.toLowerCase(), word);
  for (const word of incoming) {
    const key = word.es.toLowerCase();
    if (!key) continue;
    if (map.has(key)) map.delete(key);
    map.set(key, word);
  }
  return [...map.values()].slice(-40);
}

export const useBrisa = create<ProfileStore & Session & Actions>()(
  persist(
    (set) => ({
      profile: {
        name: "",
        level: "beginner",
        goal: "travel",
        tutorId: "elena",
        showGloss: true,
        voiceOn: true,
        onboarded: false,
        introStep: 0,
      },
      ...progressDefaults,
      pendingScenario: null,
      turnError: null,
      turnErrorCode: null,
      aiPaused: false,
      patchProfile: (patch) => set((state) => ({ profile: { ...state.profile, ...patch } })),
      setPending: (pendingScenario) => set({ pendingScenario }),
      setTurnError: (turnError, turnErrorCode = null) =>
        set({ turnError, turnErrorCode: turnError ? (turnErrorCode ?? "unavailable") : null }),
      setAiPaused: (aiPaused) => set({ aiPaused }),
      appendUser: (scenarioId, message) =>
        set((state) => ({
          threads: {
            ...state.threads,
            [scenarioId]: [...(state.threads[scenarioId] ?? []), message].slice(-40),
          },
          lastScenarioId: scenarioId,
        })),
      recordTutorReply: (scenarioId, message, clean) =>
        set((state) => {
          const touched = touchPractice(state);
          const prevTurns = state.scenarioTurns[scenarioId] ?? 0;
          const turns = prevTurns + 1;
          const alreadyDone = state.completedScenarios.includes(scenarioId);
          const justDone = turns >= SCENE_GOAL && !alreadyDone;
          const thread = [...(state.threads[scenarioId] ?? []), message].slice(-40);
          return {
            threads: { ...state.threads, [scenarioId]: thread },
            lastScenarioId: scenarioId,
            xp: state.xp + 10 + (clean ? 5 : 0) + (justDone ? 25 : 0),
            totalTurns: state.totalTurns + 1,
            cleanTurns: state.cleanTurns + (clean ? 1 : 0),
            scenarioTurns: { ...state.scenarioTurns, [scenarioId]: turns },
            completedScenarios: justDone
              ? [...state.completedScenarios, scenarioId]
              : state.completedScenarios,
            words: mergeWords(state.words, message.words ?? []),
            repsToday: touched.repsToday + 1,
            repsDate: touched.today,
            streak: touched.streak,
            lastPracticeDate: touched.lastPracticeDate,
            practiceDates: touched.practiceDates,
          };
        }),
      recordDrill: (phraseId, score) =>
        set((state) => {
          if (!phraseId || score <= 0) return state;
          const touched = touchPractice(state);
          const drillsToday = state.drillsDate === touched.today ? state.drillsToday : [];
          const already = drillsToday.includes(phraseId);
          const cleared = state.drillsCleared.includes(phraseId);
          const award = !cleared && score >= 70 ? (score >= 90 ? 8 : 4) : 0;
          return {
            repsToday: touched.repsToday + (already ? 0 : 1),
            repsDate: touched.today,
            drillsToday: already ? drillsToday : [...drillsToday, phraseId],
            drillsDate: touched.today,
            drillsCleared: award > 0 ? [...state.drillsCleared, phraseId] : state.drillsCleared,
            bestPronounce: Math.max(state.bestPronounce, score),
            xp: state.xp + award,
            streak: touched.streak,
            lastPracticeDate: touched.lastPracticeDate,
            practiceDates: touched.practiceDates,
          };
        }),
      resetProgress: () =>
        set({ ...progressDefaults, pendingScenario: null, turnError: null, turnErrorCode: null }),
    }),
    {
      name: "brisa-v1",
      partialize: (state) => ({
        profile: state.profile,
        xp: state.xp,
        streak: state.streak,
        lastPracticeDate: state.lastPracticeDate,
        practiceDates: state.practiceDates,
        repsToday: state.repsToday,
        repsDate: state.repsDate,
        drillsToday: state.drillsToday,
        drillsDate: state.drillsDate,
        drillsCleared: state.drillsCleared,
        totalTurns: state.totalTurns,
        cleanTurns: state.cleanTurns,
        bestPronounce: state.bestPronounce,
        completedScenarios: state.completedScenarios,
        scenarioTurns: state.scenarioTurns,
        words: state.words,
        threads: state.threads,
        lastScenarioId: state.lastScenarioId,
      }),
    },
  ),
);

type ProfileStore = { profile: Profile } & Progress;
