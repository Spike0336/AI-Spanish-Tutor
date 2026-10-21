import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  scenarioById,
  tutorById,
  type Correction,
  type GoalId,
  type LevelId,
  type Suggestion,
  type TutorId,
  type Word,
} from "@/lib/catalog";

const Input = z.object({
  name: z.string().max(40),
  level: z.enum(["beginner", "getting-around", "comfortable"]),
  goal: z.enum(["travel", "daily", "work", "culture", "exam"]),
  tutorId: z.enum(["elena", "mateo", "camila"]),
  scenarioId: z.string().max(40),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(600),
      }),
    )
    .max(12),
});

export type TutorTurn = {
  reply: string;
  gloss: string;
  correction: Correction | null;
  focus: string;
  suggestions: Suggestion[];
  words: Word[];
};

const goalLine: Record<GoalId, string> = {
  travel: "They want Spanish for travel: hotels, food, transport, asking for help.",
  daily: "They want Spanish for everyday life: errands, neighbors, ordinary conversation.",
  work: "They want Spanish for work: clear, polite, professional.",
  culture: "They want Spanish for culture: food, family, how people actually talk.",
  exam: "They are preparing for an exam: value accuracy, but still make them speak.",
};

const levelLine: Record<LevelId, string> = {
  beginner:
    "Use A1 Spanish only: present tense, short sentences, common words. The gloss must be a plain English translation of your reply. Suggestions must be things a beginner could actually say.",
  "getting-around":
    "Use clear A2–B1 Spanish. Leave gloss empty unless a phrase is idiomatic. Still correct real mistakes.",
  comfortable:
    "Use natural B1–B2 Spanish for your region. Leave gloss empty unless they are stuck. Correct subtler issues: register, connectors, prepositions.",
};

function cleanName(name: string) {
  const cleaned = name.replace(/[^\p{L}\p{M}\s'.-]/gu, "").trim().slice(0, 24);
  return cleaned || "friend";
}

function clip(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function readString(source: unknown, key: string, max: number) {
  if (!source || typeof source !== "object" || !(key in source)) return "";
  const value = (source as Record<string, unknown>)[key];
  return typeof value === "string" ? clip(value, max) : "";
}

function parseSuggestions(value: unknown): Suggestion[] {
  if (!Array.isArray(value)) return [];
  const out: Suggestion[] = [];
  for (const item of value) {
    if (typeof item === "string" && item.trim()) {
      out.push({ es: clip(item, 160), en: "" });
    } else if (item && typeof item === "object") {
      const es = readString(item, "es", 160);
      const en = readString(item, "en", 160);
      if (es) out.push({ es, en });
    }
    if (out.length === 2) break;
  }
  return out;
}

function parseWords(value: unknown): Word[] {
  if (!Array.isArray(value)) return [];
  const out: Word[] = [];
  for (const item of value) {
    const es = readString(item, "es", 40);
    const en = readString(item, "en", 80);
    if (!es || !en || es.split(/\s+/).length > 4) continue;
    out.push({ es, en });
    if (out.length === 2) break;
  }
  return out;
}

function parseCorrection(value: unknown): Correction | null {
  if (!value || typeof value !== "object") return null;
  const said = readString(value, "said", 300);
  const better = readString(value, "better", 300);
  const why = readString(value, "why", 240);
  if (!said || !better) return null;
  return { said, better, why };
}

function parseTurn(raw: string): TutorTurn | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
  const reply = readString(data, "reply", 800);
  if (!reply) return null;
  return {
    reply,
    gloss: readString(data, "gloss", 400),
    correction: parseCorrection(
      data && typeof data === "object" ? (data as Record<string, unknown>).correction : null,
    ),
    focus: readString(data, "focus", 80),
    suggestions: parseSuggestions(
      data && typeof data === "object" ? (data as Record<string, unknown>).suggestions : null,
    ),
    words: parseWords(data && typeof data === "object" ? (data as Record<string, unknown>).words : null),
  };
}

function regionLine(tutorId: TutorId, level: LevelId) {
  if (tutorId === "mateo") {
    return "You are from Mexico City. Use Mexican Spanish and tú. For a group, use ustedes. Prefer natural Mexican wording when it fits, without piling on slang.";
  }
  if (tutorId === "camila") {
    return level === "beginner"
      ? "You are from Buenos Aires, but this learner is a beginner: use tú, not voseo, so the forms stay familiar."
      : "You are from Buenos Aires. Use Rioplatense voseo (vos tenés, querés, sos). If they use tú, you may show the vos form once, kindly, inside the correction.";
  }
  return "You are from Madrid. Use Peninsular Spanish and tú. Use vosotros only if you are speaking to a group.";
}

function systemPrompt(input: z.infer<typeof Input>, tutorName: string, city: string, brief: string, title: string) {
  return `You are ${tutorName}, a Spanish conversation tutor from ${city}. You role-play and correct like a sharp, kind friend: one useful fix, never a lecture.

Learner name: ${cleanName(input.name)}. Level: ${input.level}. ${levelLine[input.level]}
${goalLine[input.goal]}
${regionLine(input.tutorId, input.level)}

Scene: ${title}. ${brief}
Stay inside this scene. Do not say you are an AI. No markdown, asterisks, or emoji.
If they write in English, answer in Spanish at their level and, in the correction, show them how to say what they meant.

Return only a JSON object:
{
  "reply": "1 to 3 sentences you say in Spanish",
  "gloss": "English of the reply, or empty string",
  "correction": null or {"said":"their words","better":"improved Spanish","why":"one short English sentence"},
  "focus": "one word plus a stress hint like café (ca-FÉ), or empty string",
  "suggestions": [{"es":"short reply they could say","en":"English"}, {"es":"...","en":"..."}],
  "words": [{"es":"lemma","en":"short English"}]
}
correction is null if their Spanish was fine or if they have not spoken yet. If they made several mistakes, fix only the most useful one.
suggestions: exactly 2, short enough to say out loud.
words: 0 to 2 useful words from this turn.
If they have not spoken, greet them in character and invite a reply.`;
}

async function complete(apiKey: string, messages: unknown[], jsonMode: boolean) {
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(28_000),
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.6,
      max_tokens: 500,
      messages,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
}

export const tutorTurn = createServerFn({ method: "POST" })
  .validator((input: unknown) => input)
  .handler(async ({ data }): Promise<
    { ok: true; turn: TutorTurn } | { ok: false; error: string; code: "credits" | "unavailable" }
  > => {
    const parsed = Input.safeParse(data);
    if (!parsed.success) {
      return { ok: false, code: "unavailable", error: "That lesson couldn't be read. Try again." };
    }
    const scenario = scenarioById(parsed.data.scenarioId);
    const tutor = tutorById(parsed.data.tutorId);
    if (!scenario) return { ok: false, code: "unavailable", error: "That scene isn't available." };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return {
        ok: false,
        code: "unavailable",
        error: "Your tutor is offline right now. Saying phrases still works.",
      };
    }

    const history = parsed.data.history.map((message) => ({
      role: message.role,
      content: message.content,
    }));
    const last = history[history.length - 1];
    if (!last) {
      history.push({
        role: "user",
        content: "Begin the scene now. Greet me in character and invite me to speak. No correction yet.",
      });
    } else if (last.role === "assistant") {
      history.push({ role: "user", content: "Continue the scene with your next line." });
    }

    const messages = [
      {
        role: "system",
        content: systemPrompt(parsed.data, tutor.name, tutor.city, scenario.brief, scenario.title),
      },
      ...history,
    ];

    try {
      let res = await complete(apiKey, messages, true);
      if (res.status === 400) res = await complete(apiKey, messages, false);
      else if (res.status === 429 || res.status >= 500) res = await complete(apiKey, messages, true);
      if (!res.ok) {
        if (res.status === 403) {
          const errText = await res.text();
          if (errText.includes("spending-limit") || errText.includes("credits")) {
            return {
              ok: false as const,
              code: "credits" as const,
              error:
                "Live replies are paused because this Grok account is out of credits. You can still practice the lines below, and try again after adding credits.",
            };
          }
        }
        console.error("tutor turn failed", res.status);
        return {
          ok: false as const,
          code: "unavailable" as const,
          error: "The tutor couldn't answer just now. Try once more.",
        };
      }
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = body.choices?.[0]?.message?.content ?? "";
      const turn = parseTurn(raw);
      if (!turn) {
        console.error("tutor json parse failed", raw.slice(0, 180));
        return { ok: false, code: "unavailable", error: "The reply came back tangled. Try once more." };
      }
      return { ok: true, turn };
    } catch (error) {
      console.error("tutor turn error", error instanceof Error ? error.name : "unknown");
      return { ok: false, code: "unavailable", error: "Couldn't reach your tutor. Try once more." };
    }
  });
