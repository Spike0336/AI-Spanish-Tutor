type RecResult = { isFinal: boolean; 0: { transcript: string } };

type RecEvent = { results: ArrayLike<RecResult>; resultIndex: number };

type RecError = { error: string };

type Rec = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecEvent) => void) | null;
  onerror: ((event: RecError) => void) | null;
  onend: (() => void) | null;
};

type RecCtor = new () => Rec;

function recognitionCtor(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { webkitSpeechRecognition?: RecCtor; SpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function canListen() {
  return Boolean(recognitionCtor());
}

export function speakSpanish(text: string, lang: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;
  utter.rate = 0.92;
  const voices = synth.getVoices();
  const voice =
    voices.find((item) => item.lang.toLowerCase().startsWith(lang.toLowerCase())) ??
    voices.find((item) => item.lang.toLowerCase().startsWith("es"));
  if (voice) utter.voice = voice;
  synth.cancel();
  synth.speak(utter);
}

export function warmVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.getVoices();
}

export function listenOnce(
  lang: string,
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
  onError: (message: string) => void,
) {
  const Ctor = recognitionCtor();
  if (!Ctor) {
    onError("This browser can't listen. You can type instead.");
    return { ok: false as const, stop: () => undefined };
  }
  const rec = new Ctor();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.onresult = (event) => {
    let text = "";
    let final = false;
    for (let i = 0; i < event.results.length; i += 1) {
      const piece = event.results[i];
      if (!piece) continue;
      text += piece[0].transcript;
      if (piece.isFinal) final = true;
    }
    onText(text.trim(), final);
  };
  rec.onerror = (event) => {
    if (event.error === "aborted") return;
    if (event.error === "no-speech") onError("Didn't catch that. Try again.");
    else if (event.error === "not-allowed") onError("Microphone permission is blocked.");
    else onError("Listening failed. You can type instead.");
  };
  rec.onend = () => onEnd();
  try {
    window.speechSynthesis?.cancel();
    rec.start();
  } catch {
    onError("Listening failed. You can type instead.");
    return { ok: false as const, stop: () => undefined };
  }
  return {
    ok: true as const,
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

export function speakableFocus(focus: string) {
  const word = focus.split("(")[0]?.trim();
  return word || focus;
}
