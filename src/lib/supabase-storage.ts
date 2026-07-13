import { createClient } from "@supabase/supabase-js";

const BUCKET = "question-images";
let bucketEnsured = false;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nao configurados");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function ensureBucket(client: ReturnType<typeof getServiceClient>) {
  if (bucketEnsured) return;
  const { data } = await client.storage.getBucket(BUCKET);
  if (!data) {
    await client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "5MB" });
  }
  bucketEnsured = true;
}

/** Sobe uma imagem (bytes) pro bucket publico do Supabase Storage e retorna a URL publica. */
export async function uploadQuestionImage(bytes: Buffer, filename: string): Promise<string> {
  const client = getServiceClient();
  await ensureBucket(client);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
  const { error } = await client.storage.from(BUCKET).upload(path, bytes, {
    contentType: "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error(`Falha ao subir imagem para o Supabase Storage: ${error.message}`);
  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
