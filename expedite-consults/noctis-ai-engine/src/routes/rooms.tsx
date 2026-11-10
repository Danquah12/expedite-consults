import { createFileRoute } from "@tanstack/react-router";
import { RoomsLobby } from "@/components/social/Rooms";

export const Route = createFileRoute("/rooms")({ component: RoomsLobby });
