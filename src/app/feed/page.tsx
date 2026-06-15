import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentDbUser } from "@/lib/clerk";
import { getFeed } from "@/repositories/catalog-repository";

export default async function FeedPage() {
  await getCurrentDbUser();
  const posts = await getFeed();
  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Comunidade, atualizacoes, comentarios e curtidas</p>
        <h1 className="font-display text-3xl font-bold">Feed</h1>
      </div>
      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle>{post.user.firstName} {post.user.lastName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{post.content}</p>
              <p className="mt-4 text-sm text-muted-foreground">{post.likes.length} curtidas · {post.comments.length} comentarios</p>
            </CardContent>
          </Card>
        ))}
        {posts.length === 0 && <Card><CardContent className="pt-0 text-sm text-muted-foreground">Nenhuma postagem ainda.</CardContent></Card>}
      </div>
    </AppShell>
  );
}
