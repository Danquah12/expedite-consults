import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { ClinicFrame } from "@/components/layout/ClinicFrame";
import { PostCard } from "@/components/feed/PostCard";
import { FeedPlaybackSync } from "@/components/feed/FeedPlaybackSync";
import { HydrateMedia } from "@/components/feed/HydrateMedia";
import { personByUsername, postsByUser } from "@/lib/directory";
import { CREWS } from "@/lib/feed-data";
import { useFeedStore } from "@/lib/feed-store";
import { ME } from "@/lib/current-user";
import { SubscribeBell } from "@/components/feed/SubscribeBell";

export const Route = createFileRoute("/u/$username")({ component: ProfilePage });

function ProfilePage() {
  const { username } = Route.useParams();
  const listed = personByUsername(username);
  const posts = useFeedStore((s) => s.posts);
  const theirs = postsByUser(posts, username);
  const fromPost = theirs[0]?.author;
  const person = listed ?? (fromPost
    ? {
        name: fromPost.name,
        username: fromPost.username,
        avatar: fromPost.avatar,
        bio: "On the clinic.",
        campus: "ConnectLn",
        verified: false,
        crewId: "",
      }
    : null);
  const toggleFollow = useFeedStore((s) => s.toggleFollow);
  const followOn = useFeedStore((s) => s.followOn);
  const seedFollow = posts.some((p) => p.author.username === username && p.isFollowing);
  const following = username in followOn ? followOn[username] : seedFollow;
  const crew = person ? CREWS.find((c) => c.id === person.crewId) : undefined;

  if (!person) {
    return (
      <AppShell>
        <ClinicFrame>
          <p className="rounded-2xl bg-surface p-5 text-sm text-muted shadow-border">Nobody on the hall by that name.</p>
        </ClinicFrame>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <ClinicFrame>
        <HydrateMedia />
        <FeedPlaybackSync />
        <section className="rounded-2xl bg-surface p-5 shadow-border">
          <div className="flex items-center gap-3">
            <img src={person.avatar} alt="" className="size-14 rounded-full object-cover" />
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-xl font-semibold">{person.name}</h1>
              <p className="text-xs text-muted">
                @{person.username}
                {person.verified ? " · clinic" : ""}
              </p>
            </div>
            <button
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.preventDefault();
                toggleFollow(person.username, theirs[0]?.id);
              }}
              className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-fg"
            >
              {following ? "Following" : "Follow"}
            </button>
            {person.username !== ME.username ? <SubscribeBell username={person.username} postId={theirs[0]?.id} /> : null}
          </div>
          <p className="mt-3 text-sm text-muted">{person.bio}</p>
          {crew ? <p className="mt-2 text-xs text-subtle">{crew.name} · {person.campus}</p> : null}
        </section>
        {theirs.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {theirs.length === 0 ? <p className="text-sm text-muted">No Sparks on the board yet.</p> : null}
      </ClinicFrame>
    </AppShell>
  );
}
