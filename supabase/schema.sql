-- ===========================================================================
-- ContractGuard — Supabase schema
-- ---------------------------------------------------------------------------
-- Run this in the Supabase SQL Editor (Dashboard → SQL → New query).
-- Creates two tables:
--   1. rules       — individual rule definitions (overrides local rules on ID match)
--   2. rulebooks   — full-text acts / regulations / circulars for AI context
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- TABLE: rules
-- ---------------------------------------------------------------------------
create table if not exists rules (
  id text primary key,
  sector text not null check (sector in ('construction', 'finance', 'gig-job')),
  category text not null,
  pattern_description_en text not null,
  pattern_description_hi text not null,
  pattern_description_hinglish text not null,
  legal_basis text not null,
  severity text not null check (severity in ('high', 'medium', 'low')),
  plain_english_template text not null,
  plain_hindi_template text not null,
  involves_charge_validation boolean default false,
  charge_validation_criteria text,
  permitted_charge text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_rules_sector on rules(sector);

-- ---------------------------------------------------------------------------
-- TABLE: rulebooks
-- ---------------------------------------------------------------------------
create table if not exists rulebooks (
  id uuid primary key default gen_random_uuid(),
  sector text not null check (sector in ('construction', 'finance', 'gig-job')),
  title text not null,
  source_url text,
  content text not null,
  effective_date date,
  created_at timestamptz default now()
);

create index if not exists idx_rulebooks_sector on rulebooks(sector);
create index if not exists idx_rulebooks_title on rulebooks(title);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — public read, no write (use service role for inserts)
-- ---------------------------------------------------------------------------
alter table rules enable row level security;
alter table rulebooks enable row level security;

drop policy if exists "Public read rules" on rules;
create policy "Public read rules" on rules for select using (true);

drop policy if exists "Public read rulebooks" on rulebooks;
create policy "Public read rulebooks" on rulebooks for select using (true);

-- ---------------------------------------------------------------------------
-- UPDATED_AT trigger for rules
-- ---------------------------------------------------------------------------
create or replace function update_updated_at()
returns trigger as $$ begin
  new.updated_at = now();
  return new;
end;
 $$ language plpgsql;

drop trigger if exists trg_rules_updated_at on rules;
create trigger trg_rules_updated_at
  before update on rules
  for each row execute function update_updated_at();

-- ===========================================================================
-- SAMPLE DATA — uncomment and run to seed a few rules + a rulebook
-- ===========================================================================

-- -- Sample rule: override the local RERA delay rule with a more specific one
-- insert into rules (id, sector, category, pattern_description_en, pattern_description_hi, pattern_description_hinglish, legal_basis, severity, plain_english_template, plain_hindi_template, involves_charge_validation, charge_validation_criteria, permitted_charge)
-- values (
--   'RERA-DELAY-001',
--   'construction',
--   'RERA',
--   'Clause that caps or waives the builder''s liability for delay in possession below the RERA-prescribed rate (the same rate the builder charges the allottee).',
--   'कब्ज़ा दिलाने में देरी के लिए बिल्डर की देनदारी को RERA निर्धारित दर से कम पर सीमित करने वाली धारा।',
--   'Aisi clause jo possession delay pe builder ki liability ko RERA rate se kam pe cap kare.',
--   'RERA, 2016 — Section 18(1); Pioneer Urban Land v. Govt. of NCT of Delhi (2019) 8 SCC 473',
--   'high',
--   'This clause attempts to cap the builder''s delay penalty below the statutory rate. Under RERA Section 18(1), you are entitled to compensation at the same rate of interest the builder charges you. The Supreme Court in Pioneer Urban Land (2019) confirmed this is non-negotiable. Matched clause: "{clause}".',
--   'यह धारा बिल्डर के देरी दंड को वैधानिक दर से कम पर सीमित करने का प्रयास है। RERA धारा 18(1) के तहत आपको उसी ब्याज दर पर हरजाना मिलेगा जो बिल्डर आपसे वसूलता है। मिलान की गई धारा: "{clause}"।',
--   true,
--   'The delay penalty rate must equal or exceed the interest rate the builder charges the allottee. Any cap below this is void.',
--   'Equal to the builder''s lending rate (MCLR + spread or as advertised). Minimum 2% above SBI MCLR if unspecified.'
-- )
-- on conflict (id) do nothing;

-- -- Sample rulebook: paste the full RERA Act here
-- insert into rulebooks (sector, title, source_url, content, effective_date)
-- values (
--   'construction',
--   'RERA Act 2016 — Full Text',
--   'https://www.mohua.gov.in/upload/uploadfiles/files/Real%20Estate%20(Regulation%20and%20Development)%20Act,%202016.pdf',
--   '<paste the full act text here — up to ~50KB per row is fine>',
--   '2016-03-25'
-- );
