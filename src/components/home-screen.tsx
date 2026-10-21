import { DAILY_GOAL, featuredScenarios, phraseForToday, scenarioById, tutorById } from "@/lib/catalog";
import { dayKey, liveStreak } from "@/lib/days";
import { speakSpanish } from "@/lib/speech";
import { useBrisa } from "@/lib/store";
import { Eyebrow, GoalBar, Portrait, PrimaryButton, QuietButton, ScenarioButton, WeekDots } from "@/components/ui";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function HomeScreen({ onOpen, onSpeak }: { onOpen: (id: string) => void; onSpeak: () => void }) {
  const profile = useBrisa((state) => state.profile);
  const xp = useBrisa((state) => state.xp);
  const streak = useBrisa((state) => state.streak);
  const lastPracticeDate = useBrisa((state) => state.lastPracticeDate);
  const practiceDates = useBrisa((state) => state.practiceDates);
  const repsToday = useBrisa((state) => state.repsToday);
  const repsDate = useBrisa((state) => state.repsDate);
  const completed = useBrisa((state) => state.completedScenarios);
  const lastScenarioId = useBrisa((state) => state.lastScenarioId);
  const tutor = tutorById(profile.tutorId);
  const phrase = phraseForToday(profile.level);
  const featured = featuredScenarios(profile.goal);
  const last = lastScenarioId ? scenarioById(lastScenarioId) : null;
  const start = last ?? featured[0];
  const today = dayKey();
  const reps = repsDate === today ? repsToday : 0;
  const days = liveStreak(streak, lastPracticeDate);
  const met = reps >= DAILY_GOAL;

  return (
    <div className="space-y-8 px-5 py-6">
      <header>
        <Eyebrow>Brisa</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-tight">
          {greeting()}, {profile.name}.
        </h1>
        <p className="mt-2 text-ink/70">Talk. Your tutor answers, then fixes one thing.</p>
      </header>

      <Portrait name={tutor.name} src={tutor.photo} className="h-56 w-full rounded-3xl lg:hidden" />

      <section className="rounded-3xl border border-sand p-5">
        <Eyebrow>{tutor.city}</Eyebrow>
        <h2 className="mt-2 font-display text-3xl">{tutor.name}</h2>
        <p className="mt-3 font-display text-xl italic leading-snug">{tutor.line}</p>
        {profile.showGloss ? <p className="mt-2 text-sm text-ink/60">{tutor.gloss}</p> : null}
        {start ? (
          <PrimaryButton className="mt-5 w-full" onClick={() => onOpen(start.id)}>
            {last ? `Continue · ${last.title}` : `Start · ${start.title}`}
          </PrimaryButton>
        ) : null}
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl">Today</h2>
          <p className="text-sm tabular-nums text-ink/60">
            {Math.min(reps, DAILY_GOAL)}/{DAILY_GOAL}
          </p>
        </div>
        <GoalBar value={reps} max={DAILY_GOAL} />
        <p className="mt-3 text-sm text-ink/70">
          {met ? "Today's speaking is done. Extra turns still count." : "Five reps: a scene, or a phrase said out loud."}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Streak" value={String(days)} hint={days === 1 ? "day" : "days"} />
          <Stat label="Points" value={String(xp)} hint="earned" />
          <Stat label="Scenes" value={String(completed.length)} hint="finished" />
        </div>
        <div className="mt-5">
          <WeekDots dates={practiceDates} />
        </div>
      </section>

      <section className="rounded-3xl bg-sand p-5">
        <Eyebrow>Phrase for today</Eyebrow>
        <p className="mt-3 font-display text-2xl leading-snug">{phrase.es}</p>
        <p className="mt-2 text-sm text-ink/70">{phrase.en}</p>
        <p className="mt-2 text-sm text-olive">Stress {phrase.stress}</p>
        <div className="mt-4 flex gap-2">
          <QuietButton className="flex-1 bg-paper" onClick={() => speakSpanish(phrase.es, tutor.accent)}>
            Hear it
          </QuietButton>
          <PrimaryButton className="flex-1" onClick={onSpeak}>
            Say it
          </PrimaryButton>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">For your goal</h2>
        {featured.map((scenario) => (
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

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl bg-sand px-3 py-3">
      <p className="text-xs uppercase tracking-widest text-ink/50">{label}</p>
      <p className="mt-1 font-display text-2xl tabular-nums leading-none">{value}</p>
      <p className="mt-1 text-xs text-ink/60">{hint}</p>
    </div>
  );
}
