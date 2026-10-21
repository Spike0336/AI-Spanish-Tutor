import { dayNumber } from "@/lib/days";

export const DAILY_GOAL = 5;
export const SCENE_GOAL = 6;

export const levels = [
  {
    id: "beginner",
    label: "Just starting",
    detail: "Short sentences, with English beside them.",
  },
  {
    id: "getting-around",
    label: "I can get by",
    detail: "Real situations, and lighter English.",
  },
  {
    id: "comfortable",
    label: "I can hold a conversation",
    detail: "Natural Spanish, and sharper corrections.",
  },
] as const;

export const goals = [
  { id: "travel", label: "Travel", detail: "Cafés, stations, hotels, asking for help." },
  { id: "daily", label: "Everyday life", detail: "Markets, neighbors, ordinary talk." },
  { id: "work", label: "Work", detail: "Meetings, interviews, polite and clear." },
  { id: "culture", label: "Culture", detail: "Food, family, how people actually speak." },
  { id: "exam", label: "An exam", detail: "Accurate sentences, still said out loud." },
] as const;

export type LevelId = (typeof levels)[number]["id"];
export type GoalId = (typeof goals)[number]["id"];
export type TutorId = "elena" | "mateo" | "camila";
export type DrillLevel = LevelId;

export type Tutor = {
  id: TutorId;
  name: string;
  city: string;
  from: string;
  accent: "es-ES" | "es-MX" | "es-AR";
  photo: string;
  blurb: string;
  line: string;
  gloss: string;
};

export const tutors: Tutor[] = [
  {
    id: "elena",
    name: "Elena",
    city: "Madrid",
    from: "Spain",
    accent: "es-ES",
    photo: "/tutors/elena.jpg",
    blurb: "Patient, precise, and fond of a proper café.",
    line: "Hoy vamos despacio. Una frase bien dicha vale más que diez.",
    gloss: "Today we go slowly. One well-said sentence beats ten.",
  },
  {
    id: "mateo",
    name: "Mateo",
    city: "Mexico City",
    from: "Mexico",
    accent: "es-MX",
    photo: "/tutors/mateo.jpg",
    blurb: "Warm, practical, and quick with the natural way to say it.",
    line: "Cuéntame algo de hoy. Aunque sea una frase.",
    gloss: "Tell me something about today. Even one sentence.",
  },
  {
    id: "camila",
    name: "Camila",
    city: "Buenos Aires",
    from: "Argentina",
    accent: "es-AR",
    photo: "/tutors/camila.jpg",
    blurb: "Direct, playful, and she saves voseo until you are ready.",
    line: "No hace falta que salga perfecto. Tiene que salir.",
    gloss: "It doesn't have to come out perfect. It has to come out.",
  },
];

export type ScenarioIcon =
  | "cafe"
  | "directions"
  | "market"
  | "tapas"
  | "hotel"
  | "station"
  | "meet"
  | "interview"
  | "doctor"
  | "party"
  | "libre";

export type Scenario = {
  id: string;
  title: string;
  where: string;
  minutes: number;
  icon: ScenarioIcon;
  hook: string;
  brief: string;
};

export const scenarios: Scenario[] = [
  {
    id: "cafe",
    title: "Order at a café",
    where: "A café in Madrid",
    minutes: 6,
    icon: "cafe",
    hook: "Order a drink and something small to eat.",
    brief:
      "The learner has just walked into a busy neighborhood café. You are the person behind the bar. Help them order a drink and a small bite, then react if they change their mind or ask the price.",
  },
  {
    id: "directions",
    title: "Ask for directions",
    where: "A street in Barcelona",
    minutes: 6,
    icon: "directions",
    hook: "Find the metro without getting lost.",
    brief:
      "You are a local on a sidewalk in Barcelona. The learner needs the nearest metro station. Give directions they can follow, and let them ask you to repeat or slow down.",
  },
  {
    id: "market",
    title: "At the market",
    where: "A market in Oaxaca",
    minutes: 6,
    icon: "market",
    hook: "Ask the price, then buy some fruit.",
    brief:
      "You sell fruit at a market stall in Oaxaca. The learner wants to know what is fresh, how much it costs, and how to ask for a kilo or half a kilo.",
  },
  {
    id: "tapas",
    title: "Tapas for two",
    where: "A bar in Sevilla",
    minutes: 7,
    icon: "tapas",
    hook: "Share a table and order a few plates.",
    brief:
      "You are a server at a tapas bar in Sevilla in the evening. The learner is ordering for themselves and a friend. Offer a house specialty and confirm the order.",
  },
  {
    id: "hotel",
    title: "Hotel check-in",
    where: "A hotel in Mexico City",
    minutes: 6,
    icon: "hotel",
    hook: "Check in and ask for a quieter room.",
    brief:
      "You work at the front desk of a hotel in Mexico City. The learner is checking in, may have a reservation under their name, and wants a quiet room or a late checkout.",
  },
  {
    id: "station",
    title: "The train station",
    where: "The station in Valencia",
    minutes: 6,
    icon: "station",
    hook: "Buy a ticket for the next train.",
    brief:
      "You sell tickets at the train station in Valencia. The learner wants the next train to a nearby city, one way, and needs the platform and time.",
  },
  {
    id: "meet",
    title: "Meeting the family",
    where: "Dinner in Buenos Aires",
    minutes: 8,
    icon: "meet",
    hook: "Meet your friend's parents over dinner.",
    brief:
      "You are the parent of the learner's friend at a home dinner in Buenos Aires. Welcome them, ask polite questions about where they are from and how they know your child, and offer food.",
  },
  {
    id: "interview",
    title: "A job interview",
    where: "An office in Bogotá",
    minutes: 8,
    icon: "interview",
    hook: "Introduce yourself and talk about your work.",
    brief:
      "You are interviewing the learner for a junior role in Bogotá. Ask them to introduce themselves, describe work they have done, and say why they want the job. Stay encouraging and professional.",
  },
  {
    id: "doctor",
    title: "At the clinic",
    where: "A clinic in Lima",
    minutes: 6,
    icon: "doctor",
    hook: "Explain what hurts and for how long.",
    brief:
      "You are a doctor at a clinic in Lima. The learner needs to explain a simple, non-emergency symptom, how long it has lasted, and what they need. Ask short clarifying questions. Do not give real medical advice; keep it a language scene and suggest they see a real doctor for actual symptoms.",
  },
  {
    id: "party",
    title: "Small talk",
    where: "A friend's kitchen",
    minutes: 6,
    icon: "party",
    hook: "Talk with someone you just met.",
    brief:
      "You are a guest at a small party, meeting the learner for the first time in a kitchen. Make small talk: names, how they know the host, the food, plans for the weekend. Keep it friendly, not an interrogation.",
  },
  {
    id: "libre",
    title: "Just talk",
    where: "No script",
    minutes: 8,
    icon: "libre",
    hook: "Tell your tutor about today.",
    brief:
      "You are yourself, a friend catching up, not a character in a role. Ask about the learner's actual day and react to what they say. Keep it concrete. If they go quiet, offer one small question.",
  },
];

const featuredByGoal: Record<GoalId, string[]> = {
  travel: ["cafe", "directions", "hotel"],
  daily: ["market", "tapas", "doctor"],
  work: ["interview", "cafe", "libre"],
  culture: ["tapas", "meet", "party"],
  exam: ["libre", "interview", "directions"],
};

export function tutorById(id: TutorId) {
  return tutors.find((tutor) => tutor.id === id) ?? tutors[0];
}

export function scenarioById(id: string) {
  return scenarios.find((scenario) => scenario.id === id) ?? null;
}

export function featuredScenarios(goal: GoalId) {
  return featuredByGoal[goal]
    .map((id) => scenarioById(id))
    .filter((scenario): scenario is Scenario => Boolean(scenario));
}

export type Drill = {
  id: string;
  es: string;
  en: string;
  stress: string;
  level: DrillLevel;
};

export const drills: Drill[] = [
  {
    id: "cafe-leche",
    es: "¿Me trae un café con leche?",
    en: "Could you bring me a coffee with milk?",
    stress: "ca-FÉ",
    level: "beginner",
  },
  {
    id: "mesa",
    es: "Quisiera una mesa para dos.",
    en: "I'd like a table for two.",
    stress: "me-SA",
    level: "beginner",
  },
  {
    id: "estacion",
    es: "¿Dónde está la estación?",
    en: "Where is the station?",
    stress: "es-ta-CIÓN",
    level: "beginner",
  },
  {
    id: "repetir",
    es: "No entiendo. ¿Puede repetir?",
    en: "I don't understand. Can you repeat that?",
    stress: "re-pe-TIR",
    level: "beginner",
  },
  {
    id: "cuesta",
    es: "¿Cuánto cuesta esto?",
    en: "How much does this cost?",
    stress: "CUÁN-to",
    level: "beginner",
  },
  {
    id: "ayuda",
    es: "Perdón, ¿me ayuda?",
    en: "Excuse me, can you help me?",
    stress: "a-YU-da",
    level: "beginner",
  },
  {
    id: "reserva",
    es: "Me gustaría cambiar la reserva.",
    en: "I'd like to change the reservation.",
    stress: "re-SER-va",
    level: "getting-around",
  },
  {
    id: "tren",
    es: "¿A qué hora sale el próximo tren?",
    en: "What time does the next train leave?",
    stress: "PRÓ-xi-mo",
    level: "getting-around",
  },
  {
    id: "ligero",
    es: "Estoy buscando algo más ligero.",
    en: "I'm looking for something lighter.",
    stress: "li-GE-ro",
    level: "getting-around",
  },
  {
    id: "plato",
    es: "¿Me recomienda el plato del día?",
    en: "Would you recommend the dish of the day?",
    stress: "re-co-MIEN-da",
    level: "getting-around",
  },
  {
    id: "dolor",
    es: "Llevo tres días con este dolor.",
    en: "I've had this pain for three days.",
    stress: "do-LOR",
    level: "getting-around",
  },
  {
    id: "puesto",
    es: "Trabajo en diseño y me interesa el puesto.",
    en: "I work in design and the role interests me.",
    stress: "pues-TO",
    level: "comfortable",
  },
  {
    id: "semana",
    es: "Si tuviera tiempo, me quedaría otra semana.",
    en: "If I had time, I'd stay another week.",
    stress: "que-da-RÍ-a",
    level: "comfortable",
  },
  {
    id: "acuerdo",
    es: "No estoy del todo de acuerdo.",
    en: "I don't entirely agree.",
    stress: "a-CUER-do",
    level: "comfortable",
  },
];

export function drillsForLevel(level: LevelId) {
  if (level === "beginner") return drills.filter((drill) => drill.level === "beginner");
  if (level === "getting-around") {
    return drills.filter((drill) => drill.level !== "comfortable");
  }
  return drills;
}

export function phraseForToday(level: LevelId) {
  const list = drillsForLevel(level);
  return list[Math.abs(dayNumber()) % list.length] ?? list[0];
}

export type Word = { es: string; en: string };
export type Suggestion = { es: string; en: string };
export type Correction = { said: string; better: string; why: string };

export type ChatMessage = {
  id: string;
  role: "user" | "tutor";
  text: string;
  gloss?: string;
  correction?: Correction | null;
  focus?: string;
  suggestions?: Suggestion[];
  words?: Word[];
};
