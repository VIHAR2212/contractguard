// ===========================================================================
// /lib/supabase/rules-loader.ts
// ---------------------------------------------------------------------------
// Loads rules from Supabase (if configured) and merges them with the local
// rules DB. Supabase rules override local rules with the same ID, so you
// can edit a rule in Supabase and have it take effect without redeploying.
//
// Supabase table shape — see supabase/schema.sql:
//   rules(id, sector, category, pattern_description_en, pattern_description_hi,
//         pattern_description_hinglish, legal_basis, severity,
//         plain_english_template, plain_hindi_template,
//         involves_charge_validation, charge_validation_criteria,
//         permitted_charge, created_at, updated_at)
// ===========================================================================

import type { Rule, Sector } from "@/lib/types";
import { getRulesForSector } from "@/lib/rules";
import { getSupabase, isSupabaseConfigured } from "./client";

interface SupabaseRuleRow {
  id: string;
  sector: string;
  category: string;
  pattern_description_en: string;
  pattern_description_hi: string;
  pattern_description_hinglish: string;
  legal_basis: string;
  severity: "high" | "medium" | "low";
  plain_english_template: string;
  plain_hindi_template: string;
  involves_charge_validation: boolean | null;
  charge_validation_criteria: string | null;
  permitted_charge: string | null;
}

function mapRowToRule(row: SupabaseRuleRow): Rule {
  return {
    id: row.id,
    category: row.category,
    pattern_description_en: row.pattern_description_en,
    pattern_description_hi: row.pattern_description_hi,
    pattern_description_hinglish: row.pattern_description_hinglish,
    legal_basis: row.legal_basis,
    severity: row.severity,
    plainEnglishTemplate: row.plain_english_template,
    plainHindiTemplate: row.plain_hindi_template,
    involvesChargeValidation: row.involves_charge_validation ?? undefined,
    chargeValidationCriteria: row.charge_validation_criteria ?? undefined,
    permittedCharge: row.permitted_charge ?? undefined,
    source: "supabase",
  };
}

export interface RulesLoadResult {
  rules: Rule[];
  localCount: number;
  supabaseCount: number;
  /** True if Supabase was actually queried (not just fallback) */
  fromSupabase: boolean;
}

/**
 * Load rules for a sector. Merges local + Supabase, with Supabase taking
 * precedence on ID collisions.
 */
export async function loadRulesForSector(
  sector: Sector
): Promise<RulesLoadResult> {
  const localRules = getRulesForSector(sector);

  if (!isSupabaseConfigured()) {
    return {
      rules: localRules,
      localCount: localRules.length,
      supabaseCount: 0,
      fromSupabase: false,
    };
  }

  const supabase = getSupabase();
  if (!supabase) {
    return {
      rules: localRules,
      localCount: localRules.length,
      supabaseCount: 0,
      fromSupabase: false,
    };
  }

  try {
    const { data, error } = await supabase
      .from("rules")
      .select("*")
      .eq("sector", sector);

    if (error) {
      console.error("[supabase] rules query error:", error.message);
      return {
        rules: localRules,
        localCount: localRules.length,
        supabaseCount: 0,
        fromSupabase: false,
      };
    }

    const supabaseRules = (data as SupabaseRuleRow[]).map(mapRowToRule);

    // Merge: Supabase overrides local on ID collision
    const rulesById = new Map<string, Rule>();
    for (const r of localRules) {
      rulesById.set(r.id, { ...r, source: "local" });
    }
    for (const r of supabaseRules) {
      rulesById.set(r.id, r);
    }

    return {
      rules: Array.from(rulesById.values()),
      localCount: localRules.length,
      supabaseCount: supabaseRules.length,
      fromSupabase: true,
    };
  } catch (err) {
    console.error("[supabase] rules load failed:", err);
    return {
      rules: localRules,
      localCount: localRules.length,
      supabaseCount: 0,
      fromSupabase: false,
    };
  }
}
