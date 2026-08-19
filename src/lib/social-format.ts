/** Alguns usuarios de teste/OAuth ficam sem firstName real e caem no fallback do
 * prefixo do email (ver getCurrentDbUser) - limpa esse caso na exibicao do chat. */
export function formatUserName(firstName: string, lastName?: string | null): string {
  const clean = firstName.includes("@") || firstName.includes("+") ? firstName.split(/[+@]/)[0] : firstName;
  return [clean, lastName].filter(Boolean).join(" ").trim();
}
