import { createFileRoute } from "@tanstack/react-router";
import { BrisaApp } from "@/components/brisa-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <BrisaApp />;
}
