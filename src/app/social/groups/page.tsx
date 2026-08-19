import { AppShell } from "@/components/shared/app-shell";
import { GroupsBrowser } from "@/components/social/groups-browser";
import { getCurrentDbUser } from "@/lib/clerk";
import { listGroupsForUser } from "@/repositories/social-repository";

export default async function SocialGroupsPage() {
  const user = await getCurrentDbUser();
  const groups = await listGroupsForUser(user.id);

  return (
    <AppShell>
      <GroupsBrowser
        groups={groups.map((group) => ({
          id: group.id,
          name: group.name,
          discipline: group.discipline,
          description: group.description,
          memberCount: group.memberCount,
          isMember: group.isMember,
          conversation: group.conversation ? { id: group.conversation.id } : null,
        }))}
      />
    </AppShell>
  );
}
