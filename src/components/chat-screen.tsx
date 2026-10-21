import { useEffect, useRef, useState } from "react";
import { ChevronLeft, Mic, Send, Volume2, VolumeX } from "lucide-react";
import { SCENE_GOAL, scenarioById, tutorById, type ChatMessage } from "@/lib/catalog";
import { canListen, listenOnce, speakableFocus, speakSpanish } from "@/lib/speech";
import { useBrisa } from "@/lib/store";
import { requestTutorTurn } from "@/lib/turn-client";
import { Eyebrow, Portrait, PrimaryButton, cx } from "@/components/ui";

const empty: ChatMessage[] = [];

export function ChatScreen({ scenarioId, onBack }: { scenarioId: string; onBack: () => void }) {
  const scenario = scenarioById(scenarioId);
  const profile = useBrisa((state) => state.profile);
  const tutor = tutorById(profile.tutorId);
  const messages = useBrisa((state) => state.threads[scenarioId]) ?? empty;
  const pendingScenario = useBrisa((state) => state.pendingScenario);
  const turnError = useBrisa((state) => state.turnError);
  const completed = useBrisa((state) => state.completedScenarios.includes(scenarioId));
  const turns = useBrisa((state) => state.scenarioTurns[scenarioId] ?? 0);
  const patchProfile = useBrisa((state) => state.patchProfile);
  const [draft, setDraft] = useState("");
  const [listening, setListening] = useState(false);
  const [micNote, setMicNote] = useState("");
  const [listenOk, setListenOk] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const primed = useRef(false);
  const pendingHere = pendingScenario === scenarioId;
  const blocked = Boolean(pendingScenario);

  useEffect(() => {
    setListenOk(canListen());
    return () => {
      stopRef.current?.();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, pendingHere]);

  useEffect(() => {
    if (!primed.current) {
      primed.current = true;
      return;
    }
    const last = messages[messages.length - 1];
    if (last?.role === "tutor" && profile.voiceOn) speakSpanish(last.text, tutor.accent);
  }, [messages, profile.voiceOn, tutor.accent]);

  if (!scenario) {
    return (
      <div className="px-5 py-6">
        <button type="button" onClick={onBack} className="text-sm">
          Back
        </button>
        <p className="mt-6">That scene is missing.</p>
      </div>
    );
  }

  const lastTutor = [...messages].reverse().find((message) => message.role === "tutor");

  function send(text: string) {
    const line = text.trim();
    if (!line || blocked) return;
    setDraft("");
    setMicNote("");
    void requestTutorTurn(scenarioId, line);
  }

  function toggleMic() {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
      setListening(false);
      return;
    }
    setMicNote("");
    const session = listenOnce(
      tutor.accent,
      (text) => setDraft(text),
      () => {
        stopRef.current = null;
        setListening(false);
      },
      (message) => {
        setMicNote(message);
        setListening(false);
        stopRef.current = null;
      },
    );
    if (!session.ok) return;
    stopRef.current = session.stop;
    setListening(true);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 border-b border-sand px-3 py-3">
        <button
          type="button"
          onClick={onBack}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          aria-label="Back"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <Portrait name={tutor.name} src={tutor.photo} className="h-11 w-11 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl leading-tight">{scenario.title}</h1>
          <p className="truncate text-sm text-ink/60">
            {tutor.name} · {Math.min(turns, SCENE_GOAL)}/{SCENE_GOAL}
          </p>
        </div>
        <button
          type="button"
          onClick={() => patchProfile({ voiceOn: !profile.voiceOn })}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          aria-pressed={profile.voiceOn}
          aria-label={profile.voiceOn ? "Turn voice off" : "Turn voice on"}
        >
          {profile.voiceOn ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <div className="rounded-2xl border border-sand px-4 py-4">
          <Eyebrow>{scenario.where}</Eyebrow>
          <p className="mt-2">{scenario.hook}</p>
        </div>
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            showGloss={profile.showGloss}
            accent={tutor.accent}
          />
        ))}
        {pendingHere ? <p className="text-sm text-ink/60">{tutor.name} is thinking.</p> : null}
        {completed ? (
          <p className="rounded-2xl bg-sand px-4 py-4 text-sm">
            Scene complete. That's Spanish you can actually use. Keep going if you want.
          </p>
        ) : null}
      </div>

      {lastTutor?.suggestions && lastTutor.suggestions.length > 0 && !blocked ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-2">
          {lastTutor.suggestions.map((suggestion) => (
            <button
              key={suggestion.es}
              type="button"
              onClick={() => send(suggestion.es)}
              className="min-h-11 max-w-xs shrink-0 rounded-2xl border border-sand px-3 py-2 text-left"
            >
              <span className="block text-sm font-medium">{suggestion.es}</span>
              {profile.showGloss && suggestion.en ? (
                <span className="mt-0.5 block text-xs text-ink/60">{suggestion.en}</span>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      {turnError && !blocked ? (
        <div className="px-5 pb-2">
          <p className="text-sm text-clay">{turnError}</p>
          <button
            type="button"
            onClick={() => void requestTutorTurn(scenarioId)}
            className="mt-2 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      ) : null}

      {messages.length === 0 && !pendingHere && !turnError ? (
        <div className="px-5 pb-3">
          <PrimaryButton className="w-full" onClick={() => void requestTutorTurn(scenarioId)} disabled={blocked}>
            Start the scene
          </PrimaryButton>
        </div>
      ) : null}

      <form
        className="dock border-t border-sand px-3 py-3"
        onSubmit={(event) => {
          event.preventDefault();
          send(draft);
        }}
      >
        <div className="flex items-end gap-2">
          {listenOk ? (
            <button
              type="button"
              onClick={toggleMic}
              aria-pressed={listening}
              aria-label={listening ? "Stop listening" : "Speak Spanish"}
              className={cx(
                "grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-paper",
                listening ? "pulse-ring bg-olive" : "bg-ink",
              )}
            >
              <Mic className="h-5 w-5" />
            </button>
          ) : null}
          <label className="min-w-0 flex-1">
            <span className="sr-only">Your Spanish</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value.slice(0, 400))}
              placeholder={listening ? "Listening…" : "Answer in Spanish"}
              className="h-12 w-full rounded-2xl border border-sand bg-paper px-4 text-base text-ink outline-none placeholder:text-ink/40"
            />
          </label>
          <button
            type="submit"
            disabled={!draft.trim() || blocked}
            aria-label="Send"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-ink text-paper disabled:opacity-40"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        {micNote ? <p className="mt-2 px-1 text-sm text-clay">{micNote}</p> : null}
      </form>
    </div>
  );
}

function Message({
  message,
  showGloss,
  accent,
}: {
  message: ChatMessage;
  showGloss: boolean;
  accent: string;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-xs rounded-2xl bg-ink px-4 py-3 text-paper">{message.text}</p>
      </div>
    );
  }
  return (
    <article className="rise rounded-2xl bg-sand px-4 py-4">
      <p className="text-lg leading-relaxed">{message.text}</p>
      <button
        type="button"
        onClick={() => speakSpanish(message.text, accent)}
        className="mt-2 text-sm font-medium text-ink/70"
      >
        Hear it
      </button>
      {showGloss && message.gloss ? <p className="mt-2 text-sm leading-relaxed text-ink/70">{message.gloss}</p> : null}
      {message.correction ? (
        <div className="mt-4 border-t border-ink/10 pt-3">
          <Eyebrow>One fix</Eyebrow>
          <p className="mt-2 text-sm text-ink/60">You said</p>
          <p>{message.correction.said}</p>
          <p className="mt-2 text-sm text-olive">Sounds more natural</p>
          <p className="font-medium">{message.correction.better}</p>
          {message.correction.why ? <p className="mt-2 text-sm text-ink/70">{message.correction.why}</p> : null}
        </div>
      ) : null}
      {message.focus ? (
        <button
          type="button"
          onClick={() => speakSpanish(speakableFocus(message.focus ?? ""), accent)}
          className="mt-3 min-h-11 rounded-full bg-paper px-3 text-sm"
        >
          Listen for {message.focus}
        </button>
      ) : null}
      {message.words && message.words.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {message.words.map((word) => (
            <button
              key={word.es}
              type="button"
              onClick={() => speakSpanish(word.es, accent)}
              className="min-h-11 rounded-full bg-paper px-3 text-sm"
            >
              {word.es}
              {showGloss ? <span className="text-ink/60"> · {word.en}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
    </article>
  );
}
