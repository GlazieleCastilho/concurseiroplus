import { describe, expect, it } from "vitest";
import { equivalentMonthlyPrice, getAllowedSkillsByPlan, plans, priceForCycle } from "@/lib/product";

describe("product plans", () => {
  it("applies quarterly and annual discounts", () => {
    const pro = plans.find((plan) => plan.tier === "PRO");
    expect(pro).toBeDefined();
    expect(priceForCycle(pro!, "TRIMESTRAL")).toBe(15275);
    expect(priceForCycle(pro!, "ANUAL")).toBe(46722);
    expect(equivalentMonthlyPrice(pro!, "ANUAL")).toBe(3894);
  });

  it("limits Essencial to two skills and unlocks all for Pro", () => {
    expect(getAllowedSkillsByPlan("ESSENCIAL")).toEqual(["juridica", "linguagem"]);
    expect(getAllowedSkillsByPlan("PRO")).toHaveLength(7);
    expect(getAllowedSkillsByPlan("ELITE")).toHaveLength(7);
  });
});
