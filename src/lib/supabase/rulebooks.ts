// ===========================================================================
// /lib/supabase/rulebooks.ts
// ---------------------------------------------------------------------------
// Loads full-text rulebooks (entire acts, regulations, circulars) from
// Supabase and injects them as context into the Groq prompt. This is what
// makes the AI "actually read the law" instead of just matching patterns.
//
// Supabase table shape — see supabase/schema.sql:
//   rulebooks(id, sector, title, source_url, content, effective_date)
//
// Example rows:
//   ('construction', 'RERA Act 2016 — Full Text', null, '<full act text>', '2016-03-25')
//   ('finance', 'RBI Master Direction on Credit Cards 2022', null, '<full text>', '2022-04-21')
//   ('gig-job', 'Code on Social Security 2020 — Gig Worker Provisions', null, '<relevant sections>', '2020-09-28')
// ===========================================================================

import type { Sector } from "@/lib/types";
import { getSupabase, isSupabaseConfigured } from "./client";

export interface RulebookDoc {
  id: string;
  title: string;
  sourceUrl?: string;
  content: string;
}

/**
 * Fetch all rulebook documents for a sector. Each document's content is
 * truncated to MAX_CHARS_PER_DOC to keep the prompt bounded.
 */
export async function loadRulebooksForSector(
  sector: Sector,
  maxDocs = 5,
  maxCharsPerDoc = 8000
): Promise<{ docs: RulebookDoc[]; fromSupabase: boolean }> {
  if (!isSupabaseConfigured()) {
    return { docs: [], fromSupabase: false };
  }

  const supabase = getSupabase();
  if (!supabase) return { docs: [], fromSupabase: false };

  try {
    const { data, error } = await supabase
      .from("rulebooks")
      .select("id, title, source_url, content")
      .eq("sector", sector)
      .order("created_at", { ascending: false })
      .limit(maxDocs);

    if (error) {
      console.error("[supabase] rulebooks query error:", error.message);
      return { docs: [], fromSupabase: false };
    }

    const docs: RulebookDoc[] = (data as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      sourceUrl: row.source_url ?? undefined,
      content: (row.content ?? "").slice(0, maxCharsPerDoc),
    }));

    return { docs, fromSupabase: true };
  } catch (err) {
    console.error("[supabase] rulebooks load failed:", err);
    return { docs: [], fromSupabase: false };
  }
}
