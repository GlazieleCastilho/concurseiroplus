import { createClient } from "@supabase/supabase-js";

const BUCKET = "question-images";
// Promise compartilhada em vez de um boolean: um import de PDF sobe varias imagens em
// paralelo (Promise.all), e cada uma chama ensureBucket() - sem isso, todas veem
// "bucket nao existe" ao mesmo tempo e correm pra criar, e so a primeira ganha.
let ensureBucketPromise: Promise<void> | null = null;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nao configurados");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function createBucketIfMissing(client: ReturnType<typeof getServiceClient>) {
  const { data } = await client.storage.getBucket(BUCKET);
  if (data) return;

  const { error } = await client.storage.createBucket(BUCKET, { public: true, fileSizeLimit: "5MB" });
  // "already exists": outra invocacao serverless concorrente criou o bucket entre o
  // getBucket() acima e este createBucket() - resultado esperado sob concorrencia entre
  // instancias diferentes (o cache em memoria acima so protege dentro da mesma
  // instancia), nao um erro de verdade.
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Falha ao criar bucket do Supabase Storage: ${error.message}`);
  }
}

function ensureBucket(client: ReturnType<typeof getServiceClient>): Promise<void> {
  if (!ensureBucketPromise) {
    ensureBucketPromise = createBucketIfMissing(client).catch((error: unknown) => {
      ensureBucketPromise = null; // permite tentar de novo numa proxima chamada
      throw error;
    });
  }
  return ensureBucketPromise;
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
