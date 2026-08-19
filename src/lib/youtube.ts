/** Aceita ID puro ou URL completa (watch?v=, youtu.be/, embed/, shorts/) e devolve so o ID. */
export function extractYoutubeVideoId(input: string): string {
  const trimmed = input.trim();
  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
    if (url.hostname.includes("youtube.com")) {
      const fromQuery = url.searchParams.get("v");
      if (fromQuery) return fromQuery;
      const match = url.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/);
      if (match) return match[1];
    }
  } catch {
    // nao e uma URL - assume que ja e so o ID
  }
  return trimmed;
}
