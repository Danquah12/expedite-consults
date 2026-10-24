import { createFileRoute } from "@tanstack/react-router";
import { DeskShell } from "@/components/desk/DeskShell";

export const Route = createFileRoute("/desk")({
  component: DeskShell,
});
