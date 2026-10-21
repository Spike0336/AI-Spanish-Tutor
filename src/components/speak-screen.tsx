import { useEffect, useRef, useState } from "react";
import { drillsForLevel, scenarios, tutorById, type Drill } from "@/lib/catalog";
import { phraseForToday } from "@/lib/catalog";
import { scoreNote, scorePhrase } from "@/lib/score";
import { canListen, listenOnce, speakSpanish } from "@/lib/speech";
import { useBrisa } from "@/lib/store";
import { Eyebrow, PrimaryButton, QuietButton, ScenarioButton } from "@/components/ui";

export function SpeakScreen({ onOpen }: { onOpen: (id: string) => void }) {
  const level = useBrisa((state) => state.profile.level);
  const tutor = tutorById(useBrisa((state) => state.profile.tutorId));
  const completed = useBrisa((state) => state.completedScenarios);
  const recordDrill = useBrisa((state) => state.recordDrill);
  const list = drillsForLevel(level);
  const [index, setIndex] = useState(() => {
    const today = phraseForToday(level);
    const found = list.findIndex((drill) => drill.id === today.id);
    return found < 0 ? 0 : found;
  });
  const phrase = list[index] ?? list[0];
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState("");
  const [result, setResult] = useState<{ heard: string; score: number } | null>(null);
  const [hint, setHint] = useState("");
  const [listenOk, setListenOk] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setListenOk(canListen());
    return () => stopRef.current?.();
  }, []);

  useEffect(() => {
    setResult(null);
    setHeard("");
    setHint("");
  }, [phrase?.id]);

  if (!phrase) return null;

  function toggle() {
    if (stopRef.current) {
      stopRef.current();
      stopRef.current = null;
      setListening(false);
      return;
    }
    setHint("");
    const session = listenOnce(
      tutor.accent,
      (text, final) => {
        setHeard(text);
        if (!final || !text) return;
        const score = scorePhrase(phrase.es, text);
        setResult({ heard: text, score });
        recordDrill(phrase.id, score);
      },
      () => {
        stopRef.current = null;
        setListening(false);
      },
      (message) => {
        setHint(message);
        setListening(false);
        stopRef.current = null;
      },
    );
    if (!session.ok) return;
    stopRef.current = session.stop;
    setListening(true);
  }

  return (
    <div className="space-y-8 px-5 py-6">
      <header>
        <Eyebrow>Say it</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-tight">Hear it, then say it.</h1>
      </header>
      <DrillCard
        phrase={phrase}
        listening={listening}
        heard={heard}
        result={result}
        hint={hint}
        listenOk={listenOk}
        onHear={() => speakSpanish(phrase.es, tutor.accent)}
        onToggle={toggle}
        onPrev={() => setIndex((value) => (value - 1 + list.length) % list.length)}
        onNext={() => setIndex((value) => (value + 1) % list.length)}
      />
      <section className="space-y-3">
        <h2 className="font-display text-2xl">Scenes</h2>
        <p className="text-sm text-ink/70">Six turns finishes a scene. You can keep talking after that.</p>
        {scenarios.map((scenario) => (
          <ScenarioButton
            key={scenario.id}
            scenario={scenario}
            done={completed.includes(scenario.id)}
            onOpen={onOpen}
          />
        ))}
      </section>
    </div>
  );
}

function DrillCard({
  phrase,
  listening,
  heard,
  result,
  hint,
  listenOk,
  onHear,
  onToggle,
  onPrev,
  onNext,
}: {
  phrase: Drill;
  listening: boolean;
  heard: string;
  result: { heard: string; score: number } | null;
  hint: string;
  listenOk: boolean;
  onHear: () => void;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <section className="rounded-3xl border border-sand p-5">
      <p className="font-display text-3xl leading-tight">{phrase.es}</p>
      <p className="mt-3 text-ink/70">{phrase.en}</p>
      <p className="mt-2 text-sm text-olive">Stress {phrase.stress}</p>
      <div className="mt-5 flex gap-2">
        <QuietButton className="flex-1" onClick={onHear}>
          Hear it
        </QuietButton>
        <PrimaryButton
          className="flex-1"
          tone={listening ? "olive" : "ink"}
          onClick={onToggle}
          disabled={!listenOk}
          aria-pressed={listening}
        >
          {listening ? "Listening" : "Say it"}
        </PrimaryButton>
      </div>
      {!listenOk ? (
        <p className="mt-3 text-sm text-ink/60">Typing in a scene still works. Saying a phrase needs Chrome or Safari.</p>
      ) : null}
      {listening && heard ? <p className="mt-4 text-sm text-ink/70">Hearing: {heard}</p> : null}
      {hint ? <p className="mt-4 text-sm text-clay">{hint}</p> : null}
      {result ? (
        <div className="mt-5 border-t border-sand pt-4">
          <p className="font-display text-5xl tabular-nums leading-none">{result.score}</p>
          <p className="mt-2 text-sm text-ink/70">{scoreNote(result.score)}</p>
          <p className="mt-2 text-sm text-ink/60">Heard: {result.heard}</p>
        </div>
      ) : null}
      <div className="mt-5 flex gap-2">
        <QuietButton className="flex-1" onClick={onPrev}>
          Previous
        </QuietButton>
        <QuietButton className="flex-1" onClick={onNext}>
          Next phrase
        </QuietButton>
      </div>
    </section>
  );
}
