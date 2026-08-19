import { notFound } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { SocialLayout } from "@/components/social/social-layout";
import { ChatPane } from "@/components/social/chat-pane";
import { getCurrentDbUser } from "@/lib/clerk";
import { getConversationForUser, listConversationsForUser, listMessages } from "@/repositories/social-repository";

export default async function SocialConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const user = await getCurrentDbUser();
  const { conversationId } = await params;

  const [conversation, conversations, messages] = await Promise.all([
    getConversationForUser(conversationId, user.id),
    listConversationsForUser(user.id),
    listMessages(conversationId),
  ]);
  if (!conversation) notFound();

  const other = conversation.participants.find((participant) => participant.userId !== user.id)?.user;
  const title = conversation.type === "GROUP" ? (conversation.group?.name ?? "Grupo") : `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.trim();
  const imageUrl = conversation.type === "GROUP" ? conversation.group?.imageUrl : other?.imageUrl;

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">Grupos por assunto e conversas privadas</p>
        <h1 className="font-display text-3xl font-bold">Social</h1>
      </div>
      <SocialLayout conversations={conversations} currentUserId={user.id}>
        <ChatPane
          conversationId={conversationId}
          title={title || "Conversa"}
          imageUrl={imageUrl}
          currentUserId={user.id}
          initialMessages={messages}
        />
      </SocialLayout>
    </AppShell>
  );
}
