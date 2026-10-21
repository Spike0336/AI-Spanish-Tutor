import { useEffect, useState, type ReactNode } from "react";
import { House, Mic, UserRound } from "lucide-react";
import { tutorById } from "@/lib/catalog";
import { warmVoices } from "@/lib/speech";
import { useBrisa } from "@/lib/store";
import { requestTutorTurn } from "@/lib/turn-client";
import { ChatScreen } from "@/components/chat-screen";
import { HomeScreen } from "@/components/home-screen";
import { Onboarding } from "@/components/onboarding";
import { SpeakScreen } from "@/components/speak-screen";
import { Eyebrow, Portrait, cx } from "@/components/ui";
import { YouScreen } from "@/components/you-screen";

type Tab = "home" | "speak" | "you";
type Screen = { name: Tab } | { name: "chat"; scenarioId: string };

export function BrisaApp() {
  const hydrated = useHydrated();
  const profile = useBrisa((state) => state.profile);
  const [screen, setScreen] = useState<Screen>({ name: "home" });
  const tutor = tutorById(profile.tutorId);

  useEffect(() => {
    warmVoices();
  }, []);

  if (!hydrated) {
    return (
      <div className="grid h-dvh place-items-center bg-paper px-6 text-ink">
        <div className="text-center">
          <Eyebrow>Spanish, out loud</Eyebrow>
          <h1 className="mt-3 font-display text-5xl">Brisa</h1>
        </div>
      </div>
    );
  }

  function openScene(id: string) {
    const state = useBrisa.getState();
    state.setTurnError(null);
    setScreen({ name: "chat", scenarioId: id });
    const existing = state.threads[id] ?? [];
    if (existing.length === 0 && !state.pendingScenario && !state.aiPaused) void requestTutorTurn(id);
  }

  const chatting = screen.name === "chat";
  const showNav = profile.onboarded && !chatting;

  return (
    <div className="bg-paper text-ink lg:grid lg:h-dvh lg:grid-cols-2">
      <aside className="hidden min-h-0 flex-col justify-between overflow-y-auto bg-ink px-12 py-12 text-paper lg:flex">
        <div>
          <Eyebrow light>Spanish, out loud</Eyebrow>
          <p className="mt-4 font-display text-6xl leading-none">Brisa</p>
          <p className="mt-5 max-w-sm text-lg leading-relaxed text-sand">
            A tutor who stays in the conversation, then fixes the one thing that would make you sound more natural.
          </p>
        </div>
        <figure className="mt-10">
          <Portrait name={tutor.name} src={tutor.photo} className="aspect-square w-full max-w-sm rounded-3xl" />
          <figcaption className="mt-5 max-w-sm">
            <p className="text-sm text-sand">
              {tutor.name} · {tutor.city}
            </p>
            <p className="mt-2 font-display text-2xl italic leading-snug">{tutor.line}</p>
          </figcaption>
        </figure>
      </aside>

      <div className="flex h-dvh min-h-0 flex-col lg:border-l lg:border-sand">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-col">
          {profile.onboarded ? (
            chatting ? (
              <ChatScreen scenarioId={screen.scenarioId} onBack={() => setScreen({ name: "home" })} />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {screen.name === "home" ? <HomeScreen onOpen={openScene} onSpeak={() => setScreen({ name: "speak" })} /> : null}
                {screen.name === "speak" ? <SpeakScreen onOpen={openScene} /> : null}
                {screen.name === "you" ? <YouScreen /> : null}
              </div>
            )
          ) : (
            <Onboarding />
          )}
          {showNav ? (
            <nav className="dock grid grid-cols-3 border-t border-sand" aria-label="Primary">
              <TabButton label="Home" active={screen.name === "home"} onClick={() => setScreen({ name: "home" })}>
                <House className="h-5 w-5" />
              </TabButton>
              <TabButton label="Speak" active={screen.name === "speak"} onClick={() => setScreen({ name: "speak" })}>
                <Mic className="h-5 w-5" />
              </TabButton>
              <TabButton label="You" active={screen.name === "you"} onClick={() => setScreen({ name: "you" })}>
                <UserRound className="h-5 w-5" />
              </TabButton>
            </nav>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cx("flex h-16 flex-col items-center justify-center gap-1 text-xs", active ? "font-medium text-ink" : "text-ink/50")}
    >
      {children}
      {label}
    </button>
  );
}

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const finish = () => setHydrated(true);
    const unsub = useBrisa.persist.onFinishHydration(finish);
    if (useBrisa.persist.hasHydrated()) finish();
    return unsub;
  }, []);
  return hydrated;
}
