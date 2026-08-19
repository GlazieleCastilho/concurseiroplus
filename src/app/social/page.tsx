import { AppShell } from "@/components/shared/app-shell";
import { SocialLayout } from "@/components/social/social-layout";
import { getCurrentDbUser } from "@/lib/clerk";
import { listConversationsForUser } from "@/repositories/social-repository";

export default async function SocialPage() {
  const user = await getCurrentDbUser();
  const conversations = await listConversationsForUser(user.id);

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Grupos por assunto e conversas privadas</p>
        <h1 className="font-display text-3xl font-bold">Social</h1>
      </div>
      <SocialLayout conversations={conversations} currentUserId={user.id} />
    </AppShell>
  );
}
