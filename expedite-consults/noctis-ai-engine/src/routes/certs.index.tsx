import { createFileRoute } from "@tanstack/react-router";
import { CertsHome } from "@/components/social/Hub";

export const Route = createFileRoute("/certs/")({ component: CertsHome });
