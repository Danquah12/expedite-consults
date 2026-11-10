import { createFileRoute, redirect } from "@tanstack/react-router";

/** /home moved: the Facebook-style study feed at /social is now the platform home. */
export const Route = createFileRoute("/home")({
  beforeLoad: () => {
    throw redirect({ to: "/social", replace: true });
  },
});
