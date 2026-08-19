import { createClient } from "@supabase/supabase-js";

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nao configurados");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

/** Publica uma mensagem no canal Broadcast da conversa - sem depender de RLS/Postgres Changes. */
export async function broadcastMessage(conversationId: string, message: unknown): Promise<void> {
  const client = getServiceClient();
  await client.channel(`conversation:${conversationId}`).send({
    type: "broadcast",
    event: "new_message",
    payload: message,
  });
}
