export type BadgeSnapshot = {
  totalTurns: number;
  cleanTurns: number;
  streak: number;
  completed: number;
  bestPronounce: number;
  words: number;
};

export const badges: Array<{ id: string; name: string; detail: string; test: (s: BadgeSnapshot) => boolean }> = [
  { id: "first-word", name: "Primera palabra", detail: "Send your first line.", test: (s) => s.totalTurns >= 1 },
  { id: "clean-five", name: "Limpio", detail: "Five lines with nothing to fix.", test: (s) => s.cleanTurns >= 5 },
  { id: "streak-3", name: "Tres días", detail: "Practice three days in a row.", test: (s) => s.streak >= 3 },
  { id: "streak-7", name: "Una semana", detail: "A seven-day streak.", test: (s) => s.streak >= 7 },
  { id: "scene", name: "En la calle", detail: "Finish a scene.", test: (s) => s.completed >= 1 },
  { id: "viajero", name: "Viajero", detail: "Finish three scenes.", test: (s) => s.completed >= 3 },
  { id: "oido", name: "Oído fino", detail: "Score 90 saying a phrase.", test: (s) => s.bestPronounce >= 90 },
  { id: "charla", name: "Charla", detail: "Twenty-five turns with your tutor.", test: (s) => s.totalTurns >= 25 },
  { id: "cuaderno", name: "Cuaderno", detail: "Collect ten words.", test: (s) => s.words >= 10 },
];
