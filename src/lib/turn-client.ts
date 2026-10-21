import type { ChatMessage } from "@/lib/catalog";
import { useBrisa } from "@/lib/store";
import { tutorTurn } from "@/lib/tutor-turn";

function newId() {
  return crypto.randomUUID();
}

function toHistory(messages: ChatMessage[]) {
  return messages.slice(-12).map((message) => ({
    role: message.role === "tutor" ? ("assistant" as const) : ("user" as const),
    content: message.text.slice(0, 600),
  }));
}

export async function requestTutorTurn(scenarioId: string, learnerText?: string) {
  const state = useBrisa.getState();
  if (state.pendingScenario) return false;
  state.setPending(scenarioId);
  state.setTurnError(null);
  const text = learnerText?.trim().slice(0, 400) ?? "";
  if (text) {
    state.appendUser(scenarioId, { id: newId(), role: "user", text });
  }
  const fresh = useBrisa.getState();
  try {
    const result = await tutorTurn({
      data: {
        name: fresh.profile.name,
        level: fresh.profile.level,
        goal: fresh.profile.goal,
        tutorId: fresh.profile.tutorId,
        scenarioId,
        history: toHistory(fresh.threads[scenarioId] ?? []),
      },
    });
    if (!result.ok) {
      const failed = useBrisa.getState();
      failed.setTurnError(result.error, result.code);
      if (result.code === "credits") failed.setAiPaused(true);
      return false;
    }
    useBrisa.getState().setAiPaused(false);
    useBrisa.getState().recordTutorReply(
      scenarioId,
      {
        id: newId(),
        role: "tutor",
        text: result.turn.reply,
        gloss: result.turn.gloss,
        correction: result.turn.correction,
        focus: result.turn.focus,
        suggestions: result.turn.suggestions,
        words: result.turn.words,
      },
      !result.turn.correction,
    );
    return true;
  } catch {
    useBrisa.getState().setTurnError("Couldn't reach your tutor. Try once more.");
    return false;
  } finally {
    useBrisa.getState().setPending(null);
  }
}
