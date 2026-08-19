import { createClient } from "@supabase/supabase-js";

type BucketConfig = { name: string; public: boolean; fileSizeLimit: string };

const BUCKETS = {
  questionImages: { name: "question-images", public: true, fileSizeLimit: "5MB" },
  courseThumbnails: { name: "course-thumbnails", public: true, fileSizeLimit: "5MB" },
  courseAttachments: { name: "course-attachments", public: true, fileSizeLimit: "20MB" },
  courseVideos: { name: "course-videos", public: true, fileSizeLimit: "500MB" },
} as const satisfies Record<string, BucketConfig>;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY nao configurados");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

async function createBucketIfMissing(client: ReturnType<typeof getServiceClient>, config: BucketConfig) {
  const { data } = await client.storage.getBucket(config.name);
  if (data) return;

  const { error } = await client.storage.createBucket(config.name, { public: config.public, fileSizeLimit: config.fileSizeLimit });
  // "already exists": outra invocacao serverless concorrente criou o bucket entre o
  // getBucket() acima e este createBucket() - resultado esperado sob concorrencia entre
  // instancias diferentes (o cache em memoria acima so protege dentro da mesma
  // instancia), nao um erro de verdade.
  if (error && !/already exists/i.test(error.message)) {
    throw new Error(`Falha ao criar bucket "${config.name}" do Supabase Storage: ${error.message}`);
  }
}

// Promise compartilhada por bucket em vez de um boolean: varios uploads em paralelo pro
// mesmo bucket (ex.: import de PDF sobe varias imagens de uma vez) chamam ensureBucket()
// ao mesmo tempo - sem isso, todos veem "bucket nao existe" e correm pra criar, so o
// primeiro ganha.
const ensureBucketPromises = new Map<string, Promise<void>>();

function ensureBucket(client: ReturnType<typeof getServiceClient>, config: BucketConfig): Promise<void> {
  const existing = ensureBucketPromises.get(config.name);
  if (existing) return existing;

  const promise = createBucketIfMissing(client, config).catch((error: unknown) => {
    ensureBucketPromises.delete(config.name); // permite tentar de novo numa proxima chamada
    throw error;
  });
  ensureBucketPromises.set(config.name, promise);
  return promise;
}

function buildPath(filename: string): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${filename}`;
}

async function uploadPublicFile(config: BucketConfig, bytes: Buffer, filename: string, contentType: string): Promise<string> {
  const client = getServiceClient();
  await ensureBucket(client, config);
  const path = buildPath(filename);
  const { error } = await client.storage.from(config.name).upload(path, bytes, { contentType, upsert: false });
  if (error) throw new Error(`Falha ao subir arquivo para o Supabase Storage: ${error.message}`);
  const { data } = client.storage.from(config.name).getPublicUrl(path);
  return data.publicUrl;
}

/** Sobe uma imagem (bytes) pro bucket publico do Supabase Storage e retorna a URL publica. */
export async function uploadQuestionImage(
  bytes: Buffer,
  filename: string,
  contentType: "image/jpeg" | "image/png" = "image/jpeg",
): Promise<string> {
  return uploadPublicFile(BUCKETS.questionImages, bytes, filename, contentType);
}

/** Sobe a capa (thumbnail) de um curso e retorna a URL publica. */
export async function uploadCourseThumbnail(
  bytes: Buffer,
  filename: string,
  contentType: "image/jpeg" | "image/png" | "image/webp",
): Promise<string> {
  return uploadPublicFile(BUCKETS.courseThumbnails, bytes, filename, contentType);
}

/** Sobe um PDF de material de apoio de uma aula e retorna a URL publica + nome original. */
export async function uploadCourseAttachment(bytes: Buffer, filename: string): Promise<{ url: string; name: string }> {
  const url = await uploadPublicFile(BUCKETS.courseAttachments, bytes, filename, "application/pdf");
  return { url, name: filename };
}

/**
 * Gera uma URL assinada pra upload direto do navegador pro bucket de videos - os bytes
 * do video nunca passam pelo servidor Next.js (o corpo de uma API route no Vercel trava
 * em 4.5MB). O publicUrl ja e calculado aqui pois getPublicUrl() e deterministico a
 * partir do path, nao precisa esperar o upload terminar.
 */
export async function createCourseVideoUploadTarget(
  filename: string,
): Promise<{ path: string; token: string; bucket: string; publicUrl: string }> {
  const client = getServiceClient();
  await ensureBucket(client, BUCKETS.courseVideos);
  const path = buildPath(filename);
  const { data, error } = await client.storage.from(BUCKETS.courseVideos.name).createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Falha ao gerar URL de upload assinada: ${error?.message ?? "erro desconhecido"}`);
  const { data: publicData } = client.storage.from(BUCKETS.courseVideos.name).getPublicUrl(path);
  return { path, token: data.token, bucket: BUCKETS.courseVideos.name, publicUrl: publicData.publicUrl };
}
