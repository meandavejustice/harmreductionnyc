export const CATEGORIES = {
  "syringe-services": "Syringe services & drop-ins",
  "overdose-prevention": "Overdose prevention centers",
  "naloxone-drug-checking": "Naloxone, test strips & drug checking",
  hotlines: "Hotlines",
  treatment: "Treatment on demand",
  "sexual-health": "HIV, HCV & sexual health",
  "housing-shelter": "Housing & shelter",
  "food-benefits": "Food, ID & benefits",
  legal: "Legal help",
  "community-specific": "Youth, LGBTQ+, sex workers & women",
  "training-advocacy": "Training & advocacy",
} as const;

export type Category = keyof typeof CATEGORIES;

export const BOROUGHS = [
  "Manhattan",
  "Bronx",
  "Brooklyn",
  "Queens",
  "Staten Island",
  "Citywide",
  "Statewide",
  "National",
] as const;

export type Borough = (typeof BOROUGHS)[number];

export interface Resource {
  name: string;
  category: Category;
  boroughs: Borough[];
  description: string;
  url: string;
  phone: string | null;
  address: string | null;
  services: string[];
  verified_from: string;
  /** ISO date the entry was last checked against its source. */
  verified_on: string;
  confidence: "high" | "medium";
  notes: string | null;
}
