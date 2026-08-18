import { NextResponse } from "next/server";
import { requireRole } from "@/lib/clerk";
import { prisma } from "@/lib/prisma";
import { toErrorResponse } from "@/lib/api-error";

// Endpoint temporario de diagnostico pro 404 de /admin/questions/[provaId] em
// producao - roda a mesma query do getProvaWithQuestoes contra o mesmo runtime/env
// do deploy, pra descartar diferenca de DATABASE_URL/conexao entre o SQL Editor do
// Supabase e o que o Prisma realmente enxerga. Remover depois de diagnosticado.
export async function GET(req: Request) {
  try {
    await requireRole(["admin", "super_admin"]);
    const id = new URL(req.url).searchParams.get("id") ?? "";

    const [count, exact, dbInfo] = await Promise.all([
      prisma.prova.count(),
      prisma.prova.findUnique({ where: { id } }),
      prisma.$queryRaw`SELECT current_database() as db, inet_server_addr()::text as host, current_user as usr`,
    ]);

    const sample = await prisma.prova.findMany({ take: 5, select: { id: true, banca: true, ano: true } });

    return NextResponse.json({
      queriedId: id,
      totalProvas: count,
      exactMatchFound: !!exact,
      exactMatch: exact,
      sampleIds: sample,
      dbInfo,
      databaseUrlHostHint: process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] ?? null,
    });
  } catch (error) {
    return toErrorResponse(error, "Erro no diagnostico");
  }
}
