// ===========================================================================
// /lib/rules/index.ts
// ---------------------------------------------------------------------------
// Single entry point for the rules DB. The pipeline imports from here so
// adding a new sector is a one-line change in this file.
// ===========================================================================

import type { Rule, Sector } from "@/lib/types";
import { constructionRules } from "./construction-rules";
import { financeRules } from "./finance-rules";
import { gigJobRules } from "./gig-job-rules";

export { constructionRules, financeRules, gigJobRules };

export const rulesBySector: Record<Sector, Rule[]> = {
  construction: constructionRules,
  finance: financeRules,
  "gig-job": gigJobRules,
};

export function getRulesForSector(sector: Sector): Rule[] {
  return rulesBySector[sector] ?? [];
}

export const totalRuleCount: number =
  constructionRules.length + financeRules.length + gigJobRules.length;
