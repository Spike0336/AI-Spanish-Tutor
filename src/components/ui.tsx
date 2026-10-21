import type { ButtonHTMLAttributes } from "react";
import {
  Briefcase,
  Coffee,
  Hotel,
  MapPin,
  MessageCircle,
  MessagesSquare,
  ShoppingBasket,
  Stethoscope,
  TrainFront,
  Users,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { Scenario, ScenarioIcon } from "@/lib/catalog";
import { lastDays, weekdayNarrow } from "@/lib/days";

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const icons: Record<ScenarioIcon, LucideIcon> = {
  cafe: Coffee,
  directions: MapPin,
  market: ShoppingBasket,
  tapas: UtensilsCrossed,
  hotel: Hotel,
  station: TrainFront,
  meet: Users,
  interview: Briefcase,
  doctor: Stethoscope,
  party: MessagesSquare,
  libre: MessageCircle,
};

export function Portrait({
  src,
  name,
  className,
}: {
  src: string;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <span className={cx("inline-grid overflow-hidden bg-sand text-ink", className)}>
      {failed ? (
        <span className="grid place-items-center font-display text-2xl">{name.slice(0, 1)}</span>
      ) : (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover object-top"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

export function PrimaryButton({
  className,
  type = "button",
  tone = "ink",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "ink" | "olive" }) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex h-12 items-center justify-center rounded-2xl px-5 text-center font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:cursor-default disabled:opacity-40",
        tone === "olive" ? "bg-olive" : "bg-ink",
        className,
      )}
      {...props}
    />
  );
}

export function QuietButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex h-12 items-center justify-center rounded-2xl border border-sand bg-paper px-5 text-center font-medium text-ink transition-colors duration-200 hover:bg-sand disabled:cursor-default disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}

export function Eyebrow({ children, light = false }: { children: string; light?: boolean }) {
  return (
    <p className={cx("text-xs font-medium uppercase tracking-widest", light ? "text-sand" : "text-clay")}>
      {children}
    </p>
  );
}

export function WeekDots({ dates }: { dates: string[] }) {
  const marked = new Set(dates);
  return (
    <div className="flex justify-between gap-2">
      {lastDays(7).map((key) => {
        const on = marked.has(key);
        return (
          <div key={key} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-xs text-ink/50">{weekdayNarrow(key)}</span>
            <span className={cx("h-2.5 w-2.5 rounded-full", on ? "bg-olive" : "border border-ink/30")} />
          </div>
        );
      })}
    </div>
  );
}

export function GoalBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((Math.min(value, max) / max) * 100)));
  return (
    <div
      className="h-1.5 overflow-hidden rounded-full bg-sand"
      role="progressbar"
      aria-valuenow={Math.min(value, max)}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div className="h-full rounded-full bg-olive" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ScenarioButton({
  scenario,
  done,
  onOpen,
}: {
  scenario: Scenario;
  done: boolean;
  onOpen: (id: string) => void;
}) {
  const Icon = icons[scenario.icon];
  return (
    <button
      type="button"
      onClick={() => onOpen(scenario.id)}
      className="flex w-full items-center gap-4 rounded-2xl border border-sand px-4 py-3 text-left transition-colors duration-200 hover:bg-sand"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-sand text-ink">
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{scenario.title}</span>
        <span className="mt-0.5 block text-sm text-ink/60">
          {scenario.where} · {scenario.minutes} min
        </span>
      </span>
      {done ? <span className="text-xs font-medium uppercase tracking-widest text-olive">Done</span> : null}
    </button>
  );
}

export function SwitchRow({
  label,
  detail,
  checked,
  onToggle,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center justify-between gap-4 py-3 text-left"
    >
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-ink/60">{detail}</span>
      </span>
      <span className={cx("relative h-7 w-12 shrink-0 rounded-full", checked ? "bg-olive" : "bg-sand")}>
        <span className={cx("absolute top-0.5 h-6 w-6 rounded-full bg-paper", checked ? "left-5" : "left-0.5")} />
      </span>
    </button>
  );
}
