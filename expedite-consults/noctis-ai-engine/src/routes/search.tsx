import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/components/social/Inbox";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>): { q: string } => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchRoute,
});

function SearchRoute() {
  const { q } = Route.useSearch();
  return <SearchPage key={q} q={q} />;
}
