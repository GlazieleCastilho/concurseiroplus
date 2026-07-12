import { notFound, redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { SkillChat } from "@/components/skills/skill-chat";
import { getCurrentDbUser } from "@/lib/clerk";
import { getAllowedSkillsByPlan, skills } from "@/lib/product";

export default async function SkillPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await getCurrentDbUser();
  const skill = skills.find((item) => item.slug === slug);
  if (!skill) notFound();
  if (!getAllowedSkillsByPlan(user.planTier).includes(skill.slug)) redirect("/billing");

  return (
    <AppShell>
      <div>
        <p className="text-sm text-muted-foreground">{skill.discipline}</p>
        <h1 className="font-display text-3xl font-bold">{skill.name}</h1>
      </div>
      <SkillChat slug={skill.slug} title={skill.description} />
    </AppShell>
  );
}
