import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/hub/nist")({ component: NistLayout });

function NistLayout() {
  return <Outlet />;
}
