import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/clerk";

export default async function AdminCommentsPage() {
  await requireRole(["admin", "super_admin"]);
  const comments = await prisma.comment.findMany({ include: { user: true, post: true }, orderBy: { createdAt: "desc" }, take: 100 });
  return (
    <AppShell>
      <h1 className="font-display text-3xl font-bold">Moderacao de comentarios</h1>
      <Card>
        <CardHeader><CardTitle>Comentarios recentes</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-md border border-border p-3 text-sm">
              <div className="flex justify-between gap-3">
                <strong>{comment.user.firstName}</strong>
                <span className="text-muted-foreground">{comment.hidden ? "Oculto" : "Publicado"}</span>
              </div>
              <p className="mt-2 text-muted-foreground">{comment.content}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </AppShell>
  );
}
