import { Link } from "@tanstack/react-router";
import type { FeedPost } from "@/lib/feed-data";
import { withSourceLinks } from "@/components/feed/EndHold";
import { ClipActions } from "@/components/feed/ClipActions";

export function TakeFeed({ posts }: { posts: FeedPost[] }) {
  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <article key={post.id} className="rounded-2xl bg-surface p-4 shadow-border">
          <div className="flex items-start gap-3">
            <Link to="/u/$username" params={{ username: post.author.username }}>
              <img src={post.author.avatar} alt="" className="size-9 rounded-full object-cover" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {post.author.name}{" "}
                <span className="font-normal text-subtle">@{post.author.username}</span>
              </p>
              <p className="mt-1 text-sm leading-relaxed">{withSourceLinks(post.caption)}</p>
              <p className="mt-2 text-xs text-primary">{post.teach.hook}</p>
              <ClipActions post={post} layout="row" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
