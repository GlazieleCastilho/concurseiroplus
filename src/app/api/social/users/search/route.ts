import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/clerk";
import { toErrorResponse } from "@/lib/api-error";
import { searchUsers } from "@/repositories/social-repository";

export async function GET(req: Request) {
  try {
    const user = await getCurrentDbUser();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";
    const users = await searchUsers(query, user.id);
    return NextResponse.json({ users });
  } catch (error) {
    return await toErrorResponse(error, "Erro ao buscar usuarios");
  }
}
