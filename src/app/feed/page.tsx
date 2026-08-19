import { AppShell } from "@/components/shared/app-shell";
import { FeedList } from "@/components/feed/feed-list";
import { getCurrentDbUser } from "@/lib/clerk";
import { listFeedForUser } from "@/repositories/feed-repository";

export default async function FeedPage() {
  const user = await getCurrentDbUser();
  const posts = await listFeedForUser(user.id);

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Comunidade, atualizacoes, comentarios e curtidas</p>
        <h1 className="font-display text-3xl font-bold">Feed</h1>
      </div>
      <FeedList initialPosts={posts} currentUserId={user.id} />
    </AppShell>
  );
}
