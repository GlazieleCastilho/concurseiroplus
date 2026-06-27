import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/auth(.*)",
  "/login",
  "/api/webhooks(.*)",
  "/robots.txt",
  "/sitemap.xml",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"]);

function withSecurityHeaders(response: NextResponse): NextResponse {
  const isDev = process.env.NODE_ENV !== "production";
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  if (!isDev) {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://js.sentry-cdn.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://api.anthropic.com https://api.openai.com https://api.abacatepay.com https://*.sentry.io https://*.posthog.com https://*.i.posthog.com",
      "frame-src 'self' https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com https://*.abacatepay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ")
  );
  return response;
}
export default clerkMiddleware(async (auth, req) => {
  // 1. Se for rota admin, apenas garante que o usuário está LOGADO
  if (isAdminRoute(req)) {
    await auth.protect();
  }

  // 2. Se não for rota pública, garante login
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 3. Aplica seus cabeçalhos de segurança perfeitamente
  return withSecurityHeaders(NextResponse.next());
});


export const config = {
  matcher: [
    "/((?!$|_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
