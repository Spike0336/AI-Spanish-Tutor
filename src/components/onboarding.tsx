import { ChevronLeft } from "lucide-react";
import { goals, levels, tutors } from "@/lib/catalog";
import { useBrisa } from "@/lib/store";
import { Eyebrow, Portrait, PrimaryButton, cx } from "@/components/ui";

const steps = ["Name", "Level", "Goal", "Tutor"] as const;

export function Onboarding() {
  const profile = useBrisa((state) => state.profile);
  const patchProfile = useBrisa((state) => state.patchProfile);
  const step = profile.introStep;
  const nameReady = profile.name.trim().length > 0;

  function next() {
    if (step < 3) {
      patchProfile({ introStep: step + 1 });
      return;
    }
    patchProfile({
      name: profile.name.trim(),
      onboarded: true,
      introStep: 0,
      showGloss: profile.level !== "comfortable",
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-5 py-6">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button
            type="button"
            onClick={() => patchProfile({ introStep: step - 1 })}
            className="grid h-11 w-11 place-items-center rounded-2xl border border-sand"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        ) : (
          <Eyebrow>Brisa</Eyebrow>
        )}
        <div className="flex items-center gap-1.5" aria-hidden>
          {steps.map((label, index) => (
            <span key={label} className={cx("h-1 rounded-full", index === step ? "w-8 bg-clay" : "w-2 bg-sand")} />
          ))}
        </div>
      </div>

      <div className="mt-8 min-h-0 flex-1 overflow-y-auto">
        {step === 0 ? (
          <div>
            <h1 className="font-display text-4xl leading-tight">What should your tutor call you?</h1>
            <p className="mt-3 text-ink/70">Just so the conversation feels like yours.</p>
            <label className="mt-8 block">
              <span className="sr-only">Your name</span>
              <input
                value={profile.name}
                onChange={(event) => patchProfile({ name: event.target.value.slice(0, 24) })}
                placeholder="Alex"
                autoComplete="given-name"
                className="w-full border-b border-sand bg-transparent pb-2 font-display text-4xl text-ink outline-none placeholder:text-ink/30"
              />
            </label>
          </div>
        ) : null}

        {step === 1 ? (
          <div>
            <h1 className="font-display text-4xl leading-tight">Where are you starting?</h1>
            <p className="mt-3 text-ink/70">Your tutor will match the length of their Spanish to this.</p>
            <div className="mt-6 space-y-3">
              {levels.map((level) => (
                <button
                  key={level.id}
                  type="button"
                  aria-pressed={profile.level === level.id}
                  onClick={() => patchProfile({ level: level.id })}
                  className={cx(
                    "w-full rounded-2xl border px-4 py-4 text-left",
                    profile.level === level.id ? "border-ink bg-sand" : "border-sand",
                  )}
                >
                  <span className="block font-medium">{level.label}</span>
                  <span className="mt-1 block text-sm text-ink/70">{level.detail}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div>
            <h1 className="font-display text-4xl leading-tight">What do you want Spanish for?</h1>
            <p className="mt-3 text-ink/70">Scenes on your home screen follow this. You can change it later.</p>
            <div className="mt-6 space-y-3">
              {goals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  aria-pressed={profile.goal === goal.id}
                  onClick={() => patchProfile({ goal: goal.id })}
                  className={cx(
                    "w-full rounded-2xl border px-4 py-4 text-left",
                    profile.goal === goal.id ? "border-ink bg-sand" : "border-sand",
                  )}
                >
                  <span className="block font-medium">{goal.label}</span>
                  <span className="mt-1 block text-sm text-ink/70">{goal.detail}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div>
            <h1 className="font-display text-4xl leading-tight">Choose who you talk to.</h1>
            <p className="mt-3 text-ink/70">Same lessons. A different city, and a different way of speaking.</p>
            <div className="mt-6 space-y-3">
              {tutors.map((tutor) => {
                const selected = profile.tutorId === tutor.id;
                return (
                  <button
                    key={tutor.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => patchProfile({ tutorId: tutor.id })}
                    className={cx(
                      "flex w-full items-center gap-4 rounded-2xl border px-3 py-3 text-left",
                      selected ? "border-ink bg-sand" : "border-sand",
                    )}
                  >
                    <Portrait name={tutor.name} src={tutor.photo} className="h-16 w-16 shrink-0 rounded-full" />
                    <span className="min-w-0">
                      <span className="block font-medium">
                        {tutor.name} · {tutor.from}
                      </span>
                      <span className="mt-1 block text-sm text-ink/70">{tutor.blurb}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <PrimaryButton className="mt-4 w-full" onClick={next} disabled={step === 0 && !nameReady}>
        {step === 3 ? "Start speaking" : "Continue"}
      </PrimaryButton>
    </div>
  );
}
