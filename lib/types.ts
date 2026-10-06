export type DataMode = "demo" | "research";

export type Relevance = "relevant" | "possibly_relevant" | "irrelevant";

export type FailureCode = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K";

export type Outcome = "succeeded" | "failed" | "partial" | "unknown";

export type VerificationStatus = "VERIFIED" | "PARTIALLY_VERIFIED" | "UNVERIFIED" | "INACCESSIBLE";

export type TemporalMemory =
  | "exact_date"
  | "month"
  | "year"
  | "season"
  | "relative_time"
  | "sequence"
  | "unknown";

export type SpatialMemory =
  | "country"
  | "city"
  | "location"
  | "landmark"
  | "neighborhood"
  | "trip"
  | "unknown";

export type SemanticMemory =
  | "person"
  | "object"
  | "food"
  | "animal"
  | "document"
  | "screenshot"
  | "product"
  | "event"
  | "other"
  | "unknown";

export interface MemorySignals {
  temporal: TemporalMemory[];
  spatial: SpatialMemory[];
  semantic: SemanticMemory[];
  contextual: string[];
  visual: string[];
  textual: string[];
  social: string[];
}

export interface Episode {
  id: string;
  mode: DataMode;
  synthetic: boolean;
  relevance: Relevance;
  source: string;
  sourceType?: string;
  url: string;
  date: string;
  title: string;
  author: string;
  rawText: string;
  scenario: string;
  remembers: string;
  forgot: string;
  query: string;
  searchStrategy: string;
  refinements: string;
  outcome: Outcome;
  succeeded: boolean | null;
  whyFailed: string;
  workaround: string;
  failureCode: FailureCode;
  failureRationale: string;
  memory: MemorySignals;
  strength: 1 | 2 | 3 | 4 | 5;
  archetypeId: string;
  duplicateGroupId: string;
  searchBehaviors: string[];
  verificationStatus?: VerificationStatus;
  aiInterpretation?: string;
}

export interface Archetype {
  id: string;
  name: string;
  coreSituation: string;
  memoryPattern: string;
  missingInformation: string;
  searchBehavior: string;
  failurePoint: FailureCode;
  workaround: string;
  frequency: number;
  frequencyScore: 1 | 2 | 3 | 4 | 5;
  severity: 1 | 2 | 3 | 4 | 5;
  aiOpportunity: 1 | 2 | 3 | 4 | 5;
  evidenceIds: string[];
  quotes: string[];
  opportunity: OpportunityScores;
}

export interface OpportunityScores {
  frequency: number;
  severity: number;
  evidenceStrength: number;
  strategicRelevance: number;
  affectedUsers: number;
  aiLeverage: number;
  feasibility: number;
  differentiation: number;
  overall: number;
  whyAttractive: string;
}

export interface IngestRow {
  source?: string;
  url?: string;
  date?: string;
  title?: string;
  author?: string;
  text?: string;
}

export const FAILURE_LABELS: Record<FailureCode, string> = {
  A: "Memory-expression failure",
  B: "Query formulation failure",
  C: "Understanding failure",
  D: "Representation gap",
  E: "Result noise",
  F: "Ranking failure",
  G: "Recognition failure",
  H: "Refinement failure",
  I: "Context fragmentation",
  J: "Recovery failure",
  K: "Other",
};

export const MEMORY_DIMENSIONS = [
  "Time",
  "Location",
  "People",
  "Objects",
  "Events",
  "Context",
  "Visual appearance",
  "Text",
  "Social relationships",
  "Sequence/order",
  "Emotional/contextual associations",
] as const;

export type MemoryDimension = (typeof MEMORY_DIMENSIONS)[number];
