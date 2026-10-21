import { useState } from "react";
import { badges } from "@/lib/badges";
import { goals, levels, tutors, tutorById } from "@/lib/catalog";
import { liveStreak } from "@/lib/days";
import { speakSpanish } from "@/lib/speech";
import { useBrisa } from "@/lib/store";
import { Eyebrow, Portrait, PrimaryButton, QuietButton, SwitchRow, WeekDots, cx } from "@/components/ui";

export function YouScreen() {
  const profile = useBrisa((state) => state.profile);
  const patchProfile = useBrisa((state) => state.patchProfile);
  const resetProgress = useBrisa((state) => state.resetProgress);
  const xp = useBrisa((state) => state.xp);
  const streak = useBrisa((state) => state.streak);
  const lastPracticeDate = useBrisa((state) => state.lastPracticeDate);
  const practiceDates = useBrisa((state) => state.practiceDates);
  const totalTurns = useBrisa((state) => state.totalTurns);
  const cleanTurns = useBrisa((state) => state.cleanTurns);
  const bestPronounce = useBrisa((state) => state.bestPronounce);
  const completed = useBrisa((state) => state.completedScenarios);
  const words = useBrisa((state) => state.words);
  const [confirm, setConfirm] = useState(false);
  const tutor = tutorById(profile.tutorId);
  const days = liveStreak(streak, lastPracticeDate);
  const snapshot = {
    totalTurns,
    cleanTurns,
    streak: days,
    completed: completed.length,
    bestPronounce,
    words: words.length,
  };
  const earned = new Set(badges.filter((badge) => badge.test(snapshot)).map((badge) => badge.id));

  return (
    <div className="space-y-8 px-5 py-6">
      <header>
        <Eyebrow>You</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-tight">{profile.name || "Your Spanish"}</h1>
        <p className="mt-2 text-ink/70">
          {days} day streak · {xp} points · with {tutor.name}
        </p>
      </header>

      <WeekDots dates={practiceDates} />

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-2xl">Badges</h2>
          <p className="text-sm tabular-nums text-ink/60">
            {earned.size}/{badges.length}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {badges.map((badge) => {
            const on = earned.has(badge.id);
            return (
              <article key={badge.id} className={cx("rounded-2xl border border-sand p-4", !on && "opacity-40")}>
                <h3 className="font-display text-xl leading-tight">{badge.name}</h3>
                <p className="mt-2 text-sm text-ink/70">{badge.detail}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl">Words</h2>
        {words.length === 0 ? (
          <p className="mt-3 text-sm text-ink/70">Words from your conversations land here. Tap one to hear it.</p>
        ) : (
          <ul className="mt-3 divide-y divide-sand">
            {words.map((word) => (
              <li key={word.es}>
                <button
                  type="button"
                  onClick={() => speakSpanish(word.es, tutor.accent)}
                  className="flex min-h-12 w-full items-baseline justify-between gap-3 py-3 text-left"
                >
                  <span className="font-medium">{word.es}</span>
                  <span className="text-sm text-ink/60">{word.en}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-2xl">Lesson</h2>
        <label className="block">
          <span className="text-sm text-ink/60">Name</span>
          <input
            value={profile.name}
            onChange={(event) => patchProfile({ name: event.target.value.slice(0, 24) })}
            className="mt-1 w-full border-b border-sand bg-transparent pb-2 font-display text-3xl outline-none"
          />
        </label>
        <div>
          <p className="text-sm text-ink/60">Level</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {levels.map((level) => (
              <button
                key={level.id}
                type="button"
                aria-pressed={profile.level === level.id}
                onClick={() => patchProfile({ level: level.id })}
                className={cx(
                  "min-h-11 rounded-full border px-4 text-sm",
                  profile.level === level.id ? "border-ink bg-ink text-paper" : "border-sand",
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-ink/60">Goal</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {goals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                aria-pressed={profile.goal === goal.id}
                onClick={() => patchProfile({ goal: goal.id })}
                className={cx(
                  "min-h-11 rounded-full border px-4 text-sm",
                  profile.goal === goal.id ? "border-ink bg-ink text-paper" : "border-sand",
                )}
              >
                {goal.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm text-ink/60">Tutor</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {tutors.map((item) => {
              const selected = profile.tutorId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => patchProfile({ tutorId: item.id })}
                  className={cx("rounded-2xl border p-2", selected ? "border-ink bg-sand" : "border-sand")}
                >
                  <Portrait name={item.name} src={item.photo} className="aspect-square w-full rounded-xl" />
                  <span className="mt-2 block text-sm font-medium">{item.name}</span>
                  <span className="block text-xs text-ink/60">{item.from}</span>
                </button>
              );
            })}
          </div>
        </div>
        <SwitchRow
          label="English under Spanish"
          detail="Glosses and suggestion meanings."
          checked={profile.showGloss}
          onToggle={() => patchProfile({ showGloss: !profile.showGloss })}
        />
        <SwitchRow
          label="Tutor speaks"
          detail="Plays each new reply out loud."
          checked={profile.voiceOn}
          onToggle={() => patchProfile({ voiceOn: !profile.voiceOn })}
        />
      </section>

      <section>
        {confirm ? (
          <div className="rounded-2xl border border-sand p-4">
            <p className="font-medium">Erase progress?</p>
            <p className="mt-1 text-sm text-ink/70">Streak, scenes, and words go. Your name and tutor stay.</p>
            <div className="mt-4 flex gap-2">
              <QuietButton className="flex-1" onClick={() => setConfirm(false)}>
                Keep
              </QuietButton>
              <PrimaryButton
                className="flex-1"
                onClick={() => {
                  resetProgress();
                  setConfirm(false);
                }}
              >
                Erase
              </PrimaryButton>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirm(true)} className="text-sm text-ink/60 underline">
            Erase progress
          </button>
        )}
      </section>
    </div>
  );
}
