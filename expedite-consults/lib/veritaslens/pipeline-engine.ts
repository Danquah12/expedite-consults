import { ClaimLabel, TVStationScorecard, ModelMetrics } from './types';

// Loaded / emotive lexicon dictionary for linguistic load analysis
export const LOADED_WORDS_DICT = new Set([
  'radical', 'extremist', 'dodge', 'corrupt', 'weaponized', 'disenfranchisement',
  'assault', 'scathing', 'bombshell', 'threats', 'escalating', 'lawless', 'chaos',
  'injected', 'smear', 'distort', 'pants on fire', 'destructive', 'shredded',
  'puppet', 'crisis', 'conspiracy', 'blistering', 'cover-up', 'scheme', 'demolished',
  'tyranny', 'asphyxiate', 'marxist', 'subversive', 'collusion', 'bloodbath'
]);

/**
 * Calculates lexical load as percentage of loaded/emotional words in text
 */
export function calculateLexicalLoad(text: string): { score: number; loadedWordsFound: string[] } {
  if (!text || text.trim().length === 0) {
    return { score: 0, loadedWordsFound: [] };
  }
  const cleanTokens = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  if (cleanTokens.length === 0) return { score: 0, loadedWordsFound: [] };

  const loadedWordsFound: string[] = [];
  cleanTokens.forEach(token => {
    if (LOADED_WORDS_DICT.has(token)) {
      loadedWordsFound.push(token);
    }
  });

  const score = Math.min(1.0, Number((loadedWordsFound.length / cleanTokens.length).toFixed(3)));
  return { score, loadedWordsFound: Array.from(new Set(loadedWordsFound)) };
}

/**
 * Basic sentiment polarity analyzer (-1.0 to +1.0)
 */
export function calculateSentimentPolarity(text: string): number {
  const positiveWords = ['pass', 'passed', 'support', 'bipartisan', 'growth', 'secure', 'verified', 'truth', 'protect', 'rebuild', 'funding'];
  const negativeWords = ['fail', 'chaos', 'threat', 'dodge', 'corrupt', 'destructive', 'crisis', 'smear', 'panic', 'illegal', 'dispute'];

  const lower = text.toLowerCase();
  let pos = 0;
  let neg = 0;

  positiveWords.forEach(w => {
    if (lower.includes(w)) pos++;
  });
  negativeWords.forEach(w => {
    if (lower.includes(w)) neg++;
  });

  const total = pos + neg;
  if (total === 0) return 0.0;
  return Number(((pos - neg) / total).toFixed(2));
}

/**
 * Simulates fine-tuned BERT / DeBERTa claim classifier inference with realistic probabilities
 */
export function classifyClaimText(text: string): {
  primaryLabel: ClaimLabel;
  secondaryLabel?: ClaimLabel;
  confidence: number;
  probabilities: Record<ClaimLabel, number>;
  triplet: { subject: string; predicate: string; object: string };
  reasoning: string;
} {
  const lower = text.toLowerCase();

  let primary: ClaimLabel = 'FACTUAL_CLAIM';
  let secondary: ClaimLabel | undefined = undefined;
  let conf = 0.95;
  let subject = 'ENTITY';
  let predicate = 'STATED';
  let obj = 'PROPOSITION';
  let reason = 'Sentence contains a falsifiable historical or empirical predicate.';

  if (lower.includes('?') || lower.startsWith('why') || lower.startsWith('how') || lower.startsWith('is ')) {
    primary = 'QUESTION';
    conf = 0.98;
    subject = 'INQUIRY';
    predicate = 'ASKS_ABOUT';
    obj = text.replace('?', '');
    reason = 'Syntactic structure constitutes an interrogative query without a truth claim assertion.';
  } else if (lower.includes('predict') || lower.includes('will fall') || lower.includes('will rise') || lower.includes('forecast') || lower.includes('may fall') || lower.includes('next year') || lower.includes('by 2030')) {
    primary = 'PREDICTION';
    secondary = 'ATTRIBUTED_CLAIM';
    conf = 0.94;
    subject = lower.includes('inflation') ? 'INFLATION' : 'MACRO_METRIC';
    predicate = 'PROJECTED_TRAJECTORY';
    obj = 'FUTURE_STATE';
    reason = 'Contains future modal auxiliaries and forward temporal markers that cannot be verified as existing facts.';
  } else if (lower.includes('terrible') || lower.includes('greatest') || lower.includes('disgrace') || lower.includes('bad') || lower.includes('should be') || lower.includes('wonderful') || lower.includes('worst')) {
    primary = 'OPINION';
    conf = 0.96;
    subject = 'TOPIC_OR_BILL';
    predicate = 'EVALUATED_AS';
    obj = 'NORMATIVE_VALUE';
    reason = 'Predicates rely entirely on qualitative personal evaluation and normative aesthetics rather than empirical metrics.';
  } else if (lower.includes('sharia') || lower.includes('secret plot') || lower.includes('unverified') || lower.includes('rumor') || lower.includes('dodge')) {
    primary = 'RUMOR';
    secondary = 'ATTRIBUTED_CLAIM';
    conf = 0.59;
    subject = 'SUBJECT_FIGURE';
    predicate = 'ALLEGED_STATEMENT';
    obj = 'UNSUBSTANTIATED_CLAIM';
    reason = 'Confidence score is below 0.70 due to conflicting evidentiary transcripts and partisan framing flags; routed to Active Learning queue.';
  } else if (lower.includes('senate passed') || lower.includes('hr101') || lower.includes('h.r. 101') || lower.includes('congress voted')) {
    primary = 'FACTUAL_CLAIM';
    conf = 0.97;
    subject = 'US_SENATE';
    predicate = 'PASSED';
    obj = 'HR101';
    reason = 'Specific legislative action claim with direct institutional records available for automated cross-referencing.';
  } else if (lower.includes('suggests that') || lower.includes('indicates') || lower.includes('analysis shows') || lower.includes('correlation')) {
    primary = 'ANALYSIS';
    conf = 0.91;
    subject = 'RESEARCH_DATA';
    predicate = 'INDICATES_PATTERN';
    obj = 'SYSTEMIC_OUTCOME';
    reason = 'Explanatory deduction derived from observational trends.';
  } else if (lower.includes('says') || lower.includes('warned') || lower.includes('declared') || lower.includes('claimed')) {
    primary = 'FACTUAL_CLAIM';
    secondary = 'ATTRIBUTED_CLAIM';
    conf = 0.93;
    subject = 'SPEAKER';
    predicate = 'DELIVERED_SPEECH';
    obj = 'STATEMENT_CONTENT';
    reason = 'Attributed factual proposition stating that an entity uttered specific public remarks.';
  }

  // Generate realistic probability distribution
  const allLabels: ClaimLabel[] = ['FACTUAL_CLAIM', 'OPINION', 'PREDICTION', 'ANALYSIS', 'QUESTION', 'ATTRIBUTED_CLAIM', 'RUMOR'];
  const probs: Record<ClaimLabel, number> = {} as any;
  let remaining = 1.0 - conf;

  allLabels.forEach(lbl => {
    if (lbl === primary) {
      probs[lbl] = conf;
    } else if (lbl === secondary) {
      const secShare = Number((remaining * 0.7).toFixed(3));
      probs[lbl] = secShare;
      remaining -= secShare;
    } else {
      probs[lbl] = 0;
    }
  });

  const remainingLabels = allLabels.filter(l => l !== primary && l !== secondary);
  remainingLabels.forEach(l => {
    probs[l] = Number((remaining / remainingLabels.length).toFixed(3));
  });

  return {
    primaryLabel: primary,
    secondaryLabel: secondary,
    confidence: conf,
    probabilities: probs,
    triplet: { subject, predicate, object: obj },
    reasoning: reason
  };
}

/**
 * 7-Day TV Station Credibility Grade Calculator
 */
export function calculateTVStationScore(card: Partial<TVStationScorecard>): {
  finalScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
} {
  const base = 100;
  const omissions = (card.deductions?.storyOmissions?.count || 0) * 5;
  const factOpinion = (card.deductions?.factToOpinionRatio?.opinionPercentage || 0) > 40 ? 10 : 0;
  const spin = card.deductions?.linguisticLoad?.persistentSpinDetected ? 10 : 0;
  const correction = (card.deductions?.correctionTransparency?.unretractedErrors || 0) * 25;

  const deductionsTotal = omissions + factOpinion + spin + correction;
  const finalScore = Math.max(0, base - deductionsTotal);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (finalScore >= 90) grade = 'A';
  else if (finalScore >= 80) grade = 'B';
  else if (finalScore >= 70) grade = 'C';
  else if (finalScore >= 60) grade = 'D';
  else grade = 'F';

  return { finalScore, grade };
}

/**
 * Calculates Population Stability Index (PSI) between baseline and production distribution
 */
export function calculatePSI(baseline: number[], production: number[]): number {
  if (baseline.length !== production.length || baseline.length === 0) return 0;
  let psi = 0;
  for (let i = 0; i < baseline.length; i++) {
    const b = Math.max(0.0001, baseline[i]);
    const p = Math.max(0.0001, production[i]);
    psi += (p - b) * Math.log(p / b);
  }
  return Number(psi.toFixed(4));
}

/**
 * Generates programmatic brand-safety blocklist CSV or JSON
 */
export function exportBrandSafetyBlocklist(
  outlets: any[],
  minReliabilityScore: number,
  excludeExtremeBias: boolean,
  format: 'json' | 'csv'
): string {
  const filtered = outlets.filter(o => {
    const failsReliability = o.reliabilityScore < minReliabilityScore;
    const failsBias = excludeExtremeBias && (o.biasCategory === 'Left' || o.biasCategory === 'Right');
    return failsReliability || failsBias;
  });

  if (format === 'json') {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        filterParameters: { minReliabilityScore, excludeExtremeBias },
        blockedDomainsCount: filtered.length,
        blocklist: filtered.map(o => ({
          domain: o.domain,
          name: o.name,
          reliabilityScore: o.reliabilityScore,
          biasCategory: o.biasCategory,
          riskLevel: o.brandSafetyRisk,
          reason: `Fails threshold: Reliability ${o.reliabilityScore}/64, Bias ${o.biasCategory}`
        }))
      },
      null,
      2
    );
  }

  // CSV format
  const headers = 'Domain,Outlet Name,Reliability Score,Bias Category,Brand Safety Risk,Action\n';
  const rows = filtered
    .map(o => `"${o.domain}","${o.name}",${o.reliabilityScore},"${o.biasCategory}","${o.brandSafetyRisk}","BLOCK_AD_SERVING"`)
    .join('\n');
  return headers + rows;
}
