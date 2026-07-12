import { NextResponse } from "next/server";

/**
 * requireAuth/requireRole/requireKey throw plain Response objects with a text body
 * (e.g. `new Response("Unauthorized", { status: 401 })`). Returning those as-is breaks
 * clients that always call `response.json()`, since the body isn't valid JSON.
 */
export async function toErrorResponse(error: unknown, fallbackMessage: string): Promise<NextResponse> {
  if (error instanceof Response) {
    const message = await error.text();
    return NextResponse.json({ error: message || fallbackMessage }, { status: error.status || 500 });
  }
  return NextResponse.json({ error: error instanceof Error ? error.message : fallbackMessage }, { status: 500 });
}
