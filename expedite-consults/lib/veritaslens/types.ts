export type BiasRating = 'Left' | 'Lean_Left' | 'Center' | 'Lean_Right' | 'Right';
export type FactualityRating = 'High' | 'Very_High' | 'Mixed' | 'Low' | 'Very_Low';
export type ClaimLabel = 
  | 'FACTUAL_CLAIM'
  | 'OPINION'
  | 'PREDICTION'
  | 'ANALYSIS'
  | 'QUESTION'
  | 'ATTRIBUTED_CLAIM'
  | 'RUMOR';

export interface MediaOutlet {
  id: string;
  name: string;
  domain: string;
  biasScore: number; // -42 to +42
  biasCategory: BiasRating;
  reliabilityScore: number; // 0 to 64
  factualityCategory: FactualityRating;
  ownerType: 'Conglomerate' | 'Private' | 'Government-Funded' | 'Independent' | 'Public Trust';
  ownerName: string;
  country: string;
  description: string;
  brandSafetyRisk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface NewsArticle {
  id: string;
  outletId: string;
  outletName: string;
  title: string;
  url: string;
  publishedAt: string;
  author: string;
  cleanedContent: string;
  lexicalLoad: number; // 0.0 to 1.0 (percentage of loaded words)
  sentimentScore: number; // -1.0 to +1.0
  biasAlignment: BiasRating;
  clusterId: string;
  primarySubject: string;
}

export interface NewsCluster {
  id: string;
  representativeTitle: string;
  category: 'Politics' | 'Legal' | 'Economy' | 'Foreign Affairs' | 'Social';
  year?: number;
  firstReportedAt: string;
  leftCoveragePct: number;
  centerCoveragePct: number;
  rightCoveragePct: number;
  totalArticlesCount: number;
  blindspotType: 'Left_Blindspot' | 'Right_Blindspot' | 'Balanced';
  asymmetryReason: string;
  rawWireFactSummary: string; // The neutral AP/Reuters unspun facts
  rawWireSource: 'Associated Press' | 'Reuters';
  articles: NewsArticle[];
}

export interface ClaimRecord {
  id: string;
  articleId: string;
  outletName: string;
  sentence: string;
  primaryLabel: ClaimLabel;
  secondaryLabel?: ClaimLabel;
  confidence: number;
  extractedTriplet?: {
    subject: string;
    predicate: string;
    object: string;
    context?: string;
  };
  resolvedEntities?: {
    entity: string;
    matchedId: string;
    type: 'Person' | 'Legislation' | 'Agency' | 'Location' | 'Metric';
    canonicalName: string;
  }[];
  evidenceScore: number; // 0 to 100
  evidenceStatus: 'Supported' | 'Contradicted' | 'Mixed' | 'Unverified';
  evidenceDetails: {
    source: string;
    qualityScore: number;
    notes: string;
    isOfficialRecord: boolean;
  }[];
  reviewStatus: 'Auto_Accepted' | 'Pending_Review' | 'Reviewed' | 'Retrained';
  reviewerCorrection?: ClaimLabel;
  lineage: ClaimLineage;
}

export interface ClaimLineage {
  originArticleUrl: string;
  originOutlet: string;
  ingestionTimestamp: string;
  tokenizer: string;
  classificationModel: string;
  extractionModel: string;
  entityModel: string;
  confidenceContributions: {
    factor: string;
    weight: number; // e.g. +25 for Congressional Record, -5 for Anonymous Source
  }[];
  lastAuditTimestamp: string;
  auditorId?: string;
}

export interface KafkaTopicMessage {
  id: string;
  topic: 
    | 'articles.raw'
    | 'articles.cleaned'
    | 'claims.classified'
    | 'claims.extracted'
    | 'entities.resolved'
    | 'evidence.discovered'
    | 'claims.scored'
    | 'deadletter.llm'
    | 'claims.replay';
  timestamp: string;
  partition: number;
  offset: number;
  key: string;
  payload: Record<string, any>;
  status: 'PROCESSED' | 'IN_FLIGHT' | 'FAILED' | 'REPLAYED';
  retryCount?: number;
  error?: string;
}

export interface DLQRecord {
  id: string;
  messageId: string;
  originalTopic: string;
  error: string;
  errorCategory: 'Token_Limit_Exceeded' | 'JSON_Parse_Error' | 'Rate_Limit' | 'Schema_Mismatch' | 'Network_Timeout';
  retryCount: number;
  timestamp: string;
  payload: Record<string, any>;
  resolved: boolean;
  replayedAt?: string;
}

export interface TVStationScorecard {
  id: string;
  networkName: string;
  trackingPeriod: string;
  baseScore: number; // 100
  deductions: {
    storyOmissions: {
      count: number;
      pointsDeducted: number; // 5 pts each
      details: string[];
    };
    factToOpinionRatio: {
      opinionPercentage: number; // if > 40%, deduct 10
      pointsDeducted: number;
      details: string;
    };
    linguisticLoad: {
      persistentSpinDetected: boolean;
      pointsDeducted: number; // 10 pts
      flaggedTerms: string[];
    };
    correctionTransparency: {
      unretractedErrors: number;
      pointsDeducted: number; // 25 pts
      details: string;
    };
  };
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  keyAnalyticalFindings: string;
}

export interface SpinComparisonCase {
  id: string;
  topic: string;
  groundTruthText: string;
  leftHeadline: string;
  leftOutlet: string;
  leftFramingAnalysis: string;
  leftLoadedWords: string[];
  rightHeadline: string;
  rightOutlet: string;
  rightFramingAnalysis: string;
  rightLoadedWords: string[];
  omissionsAnalysis: string;
}

export interface ModelMetrics {
  version: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  totalEvaluated: number;
  perClassMetrics: Record<ClaimLabel, { precision: number; recall: number; f1: number; count: number }>;
  confusionMatrix: {
    labels: ClaimLabel[];
    matrix: number[][];
  };
  driftMetrics: {
    psi: number; // Population Stability Index
    klDivergence: number;
    driftStatus: 'Stable' | 'Moderate_Drift' | 'Significant_Drift';
    confidenceShiftPct: number;
    timestamp: string;
  };
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'Article' | 'Claim' | 'Entity' | 'Evidence' | 'Source' | 'Model' | 'Reviewer';
  properties: Record<string, any>;
  x?: number;
  y?: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  source: string;
  target: string;
  relation: 
    | 'GENERATED_FROM'
    | 'EXTRACTED_BY'
    | 'RESOLVED_AS'
    | 'SUPPORTED_BY'
    | 'CONTRADICTED_BY'
    | 'CONTRIBUTES_TO'
    | 'AMPLIFIED_BY'
    | 'REVIEWED_BY';
  confidence?: number;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'copilot' | 'supervisor' | 'claim_extractor' | 'entity_resolver' | 'reflection_agent';
  content: string;
  timestamp: string;
  structuredOutput?: {
    confidence: number;
    verdict: 'VERIFIED' | 'CONTRADICTED' | 'CONTEXT_DEPENDENT' | 'UNRESOLVED';
    evidenceCitations: {
      source: string;
      title: string;
      url?: string;
      weight: number;
      finding: string;
    }[];
    propagationSummary?: string;
  };
}
