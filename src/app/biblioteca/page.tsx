import Link from "next/link";
import { FileText, Search } from "lucide-react";
import { AppShell } from "@/components/shared/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentDbUser } from "@/lib/clerk";
import { listLibraryCategories, listLibraryDocuments } from "@/repositories/library-repository";

export default async function BibliotecaPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  await getCurrentDbUser();
  const { category, q } = await searchParams;

  const [documents, categories] = await Promise.all([
    listLibraryDocuments({ category, search: q }),
    listLibraryCategories(),
  ]);

  return (
    <AppShell>
      <div>
        <h1 className="font-display text-3xl font-bold">Biblioteca</h1>
        <p className="mt-1 text-sm text-muted-foreground">Material de apoio em PDF, organizado por categoria.</p>
      </div>

      <form className="flex gap-2" action="/biblioteca" method="GET">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input name="q" defaultValue={q} placeholder="Buscar por titulo..." className="pl-8" />
        </div>
        <Button type="submit" variant="outline">Buscar</Button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href={q ? `/biblioteca?q=${encodeURIComponent(q)}` : "/biblioteca"}>
            <Badge variant={!category ? "default" : "outline"} className="cursor-pointer">Todas</Badge>
          </Link>
          {categories.map((item) => {
            const href = `/biblioteca?category=${encodeURIComponent(item)}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
            return (
              <Link key={item} href={href}>
                <Badge variant={category === item ? "default" : "outline"} className="cursor-pointer">{item}</Badge>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardHeader>
              <Badge variant="outline" className="w-fit">{document.category}</Badge>
              <CardTitle className="text-base">{document.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {document.description && <p className="text-sm text-muted-foreground">{document.description}</p>}
              <a href={document.fileUrl} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary" className="w-full">
                  <FileText className="h-4 w-4" /> Baixar PDF
                </Button>
              </a>
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-muted-foreground">Nenhum documento encontrado.</p>
        )}
      </div>
    </AppShell>
  );
}
