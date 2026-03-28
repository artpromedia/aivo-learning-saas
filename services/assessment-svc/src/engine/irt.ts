/**
 * 2-Parameter Logistic (2PL) Item Response Theory Engine
 *
 * Implements adaptive baseline assessment using:
 * - 2PL model: P(correct | theta, a, b) = 1 / (1 + exp(-a * (theta - b)))
 * - Maximum Likelihood Estimation (MLE) for ability estimation
 * - Fisher Information for optimal item selection
 * - Standard Error tracking for termination
 */

export interface IrtItem {
  id: string;
  domain: string;
  skill: string;
  difficulty: number;      // b parameter (logit scale, typically -3 to +3)
  discrimination: number;  // a parameter (typically 0.5 to 2.5)
  prompt: string;
  type: "multiple_choice" | "drag_drop" | "fill_blank" | "matching";
  options?: string[];
  correctAnswer: string;
  imageUrl?: string;
  /** Functioning level formats this item is available in */
  formats: FunctioningLevelFormat[];
}

export type FunctioningLevel =
  | "STANDARD"
  | "SUPPORTED"
  | "LOW_VERBAL"
  | "NON_VERBAL"
  | "PRE_SYMBOLIC";

export type FunctioningLevelFormat =
  | "STANDARD"
  | "SIMPLIFIED"
  | "PICTURE_BASED"
  | "OBSERVATION"
  | "MILESTONE";

export interface IrtResponse {
  itemId: string;
  correct: boolean;
  responseTimeMs?: number;
}

export interface IrtState {
  theta: number;            // Current ability estimate
  standardError: number;    // Current SE of theta
  responses: IrtResponse[];
  administeredItemIds: string[];
  domainThetas: Record<string, { theta: number; count: number }>;
}

export interface IrtConfig {
  maxItems: number;
  seThreshold: number;
  initialTheta: number;
  thetaMin: number;
  thetaMax: number;
}

const DEFAULT_CONFIG: IrtConfig = {
  maxItems: 30,
  seThreshold: 0.3,
  initialTheta: 0.0,
  thetaMin: -4.0,
  thetaMax: 4.0,
};

/**
 * Maps functioning level to the item format filter
 */
export function getFunctioningLevelFormat(level: FunctioningLevel): FunctioningLevelFormat {
  switch (level) {
    case "STANDARD":
      return "STANDARD";
    case "SUPPORTED":
      return "SIMPLIFIED";
    case "LOW_VERBAL":
      return "PICTURE_BASED";
    case "NON_VERBAL":
      return "OBSERVATION";
    case "PRE_SYMBOLIC":
      return "MILESTONE";
  }
}

/**
 * 2PL probability function
 * P(correct | theta, a, b) = 1 / (1 + exp(-a * (theta - b)))
 */
export function probability(theta: number, a: number, b: number): number {
  const exponent = -a * (theta - b);
  // Clamp to prevent overflow
  if (exponent > 500) return 0;
  if (exponent < -500) return 1;
  return 1 / (1 + Math.exp(exponent));
}

/**
 * Fisher Information for a single item at given theta
 * I(theta) = a^2 * P(theta) * (1 - P(theta))
 */
export function fisherInformation(theta: number, a: number, b: number): number {
  const p = probability(theta, a, b);
  return a * a * p * (1 - p);
}

/**
 * Log-likelihood of a response pattern at given theta
 */
function logLikelihood(theta: number, items: IrtItem[], responses: IrtResponse[]): number {
  let ll = 0;
  for (const response of responses) {
    const item = items.find((i) => i.id === response.itemId);
    if (!item) continue;
    const p = probability(theta, item.discrimination, item.difficulty);
    // Clamp to avoid log(0)
    const pClamped = Math.max(1e-10, Math.min(1 - 1e-10, p));
    if (response.correct) {
      ll += Math.log(pClamped);
    } else {
      ll += Math.log(1 - pClamped);
    }
  }
  return ll;
}

/**
 * Maximum Likelihood Estimation of theta using Newton-Raphson
 */
export function estimateTheta(
  items: IrtItem[],
  responses: IrtResponse[],
  config: IrtConfig = DEFAULT_CONFIG,
): number {
  if (responses.length === 0) return config.initialTheta;

  // If all correct or all incorrect, use bounded Bayesian-modal estimate
  const allCorrect = responses.every((r) => r.correct);
  const allIncorrect = responses.every((r) => !r.correct);

  if (allCorrect || allIncorrect) {
    return bayesianModalEstimate(items, responses, config);
  }

  let theta = config.initialTheta;
  const maxIterations = 50;
  const convergenceThreshold = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    let firstDerivative = 0;
    let secondDerivative = 0;

    for (const response of responses) {
      const item = items.find((i) => i.id === response.itemId);
      if (!item) continue;

      const p = probability(theta, item.discrimination, item.difficulty);
      const a = item.discrimination;
      const u = response.correct ? 1 : 0;

      firstDerivative += a * (u - p);
      secondDerivative -= a * a * p * (1 - p);
    }

    if (Math.abs(secondDerivative) < 1e-10) break;

    const delta = firstDerivative / secondDerivative;
    theta -= delta;
    theta = Math.max(config.thetaMin, Math.min(config.thetaMax, theta));

    if (Math.abs(delta) < convergenceThreshold) break;
  }

  return theta;
}

/**
 * Bayesian-modal estimate for edge cases (all correct/incorrect)
 * Adds a weak N(0,1) prior to regularize
 */
function bayesianModalEstimate(
  items: IrtItem[],
  responses: IrtResponse[],
  config: IrtConfig,
): number {
  let theta = config.initialTheta;
  const priorMean = 0;
  const priorVariance = 1;

  for (let iter = 0; iter < 50; iter++) {
    let firstDerivative = -(theta - priorMean) / priorVariance;
    let secondDerivative = -1 / priorVariance;

    for (const response of responses) {
      const item = items.find((i) => i.id === response.itemId);
      if (!item) continue;

      const p = probability(theta, item.discrimination, item.difficulty);
      const a = item.discrimination;
      const u = response.correct ? 1 : 0;

      firstDerivative += a * (u - p);
      secondDerivative -= a * a * p * (1 - p);
    }

    if (Math.abs(secondDerivative) < 1e-10) break;

    const delta = firstDerivative / secondDerivative;
    theta -= delta;
    theta = Math.max(config.thetaMin, Math.min(config.thetaMax, theta));

    if (Math.abs(delta) < 0.001) break;
  }

  return theta;
}

/**
 * Calculate Standard Error of theta estimate
 * SE = 1 / sqrt(sum of Fisher Information)
 */
export function calculateSE(theta: number, items: IrtItem[], administeredIds: string[]): number {
  let totalInfo = 0;
  for (const id of administeredIds) {
    const item = items.find((i) => i.id === id);
    if (!item) continue;
    totalInfo += fisherInformation(theta, item.discrimination, item.difficulty);
  }
  if (totalInfo <= 0) return 10; // Very high SE if no info
  return 1 / Math.sqrt(totalInfo);
}

/**
 * Select the next optimal item using Maximum Fisher Information criterion
 */
export function selectNextItem(
  theta: number,
  availableItems: IrtItem[],
  administeredIds: Set<string>,
  targetDomain?: string,
): IrtItem | null {
  const candidates = availableItems.filter(
    (item) => !administeredIds.has(item.id) && (!targetDomain || item.domain === targetDomain),
  );

  if (candidates.length === 0) return null;

  let bestItem: IrtItem | null = null;
  let bestInfo = -Infinity;

  for (const item of candidates) {
    const info = fisherInformation(theta, item.discrimination, item.difficulty);
    if (info > bestInfo) {
      bestInfo = info;
      bestItem = item;
    }
  }

  return bestItem;
}

/**
 * Select next item with balanced domain coverage
 * Picks the domain with fewest items administered, then selects max-info item from that domain
 */
export function selectNextItemBalanced(
  state: IrtState,
  availableItems: IrtItem[],
  domains: string[],
): IrtItem | null {
  const administeredSet = new Set(state.administeredItemIds);

  // Count items per domain
  const domainCounts: Record<string, number> = {};
  for (const domain of domains) {
    domainCounts[domain] = 0;
  }
  for (const id of state.administeredItemIds) {
    const item = availableItems.find((i) => i.id === id);
    if (item && item.domain in domainCounts) {
      domainCounts[item.domain]++;
    }
  }

  // Find domain with fewest items (that still has available items)
  let minCount = Infinity;
  let targetDomain: string | undefined;

  for (const domain of domains) {
    const hasAvailable = availableItems.some(
      (i) => i.domain === domain && !administeredSet.has(i.id),
    );
    if (hasAvailable && domainCounts[domain] < minCount) {
      minCount = domainCounts[domain];
      targetDomain = domain;
    }
  }

  // Use domain-specific theta if available
  const domainTheta = targetDomain && state.domainThetas[targetDomain]
    ? state.domainThetas[targetDomain].theta
    : state.theta;

  return selectNextItem(domainTheta, availableItems, administeredSet, targetDomain);
}

/**
 * Check if the assessment should terminate
 */
export function shouldTerminate(state: IrtState, config: IrtConfig = DEFAULT_CONFIG): boolean {
  if (state.responses.length >= config.maxItems) return true;
  if (state.responses.length >= 5 && state.standardError < config.seThreshold) return true;
  return false;
}

/**
 * Create initial IRT state
 */
export function createInitialState(initialTheta: number = 0): IrtState {
  return {
    theta: initialTheta,
    standardError: 10,
    responses: [],
    administeredItemIds: [],
    domainThetas: {},
  };
}

/**
 * Process a response and update the IRT state
 */
export function processResponse(
  state: IrtState,
  allItems: IrtItem[],
  response: IrtResponse,
  config: IrtConfig = DEFAULT_CONFIG,
): IrtState {
  const newResponses = [...state.responses, response];
  const newAdministered = [...state.administeredItemIds, response.itemId];

  // Update global theta
  const newTheta = estimateTheta(allItems, newResponses, config);
  const newSE = calculateSE(newTheta, allItems, newAdministered);

  // Update domain-specific theta
  const item = allItems.find((i) => i.id === response.itemId);
  const newDomainThetas = { ...state.domainThetas };

  if (item) {
    const domainResponses = newResponses.filter((r) => {
      const rItem = allItems.find((i) => i.id === r.itemId);
      return rItem?.domain === item.domain;
    });
    const domainItems = allItems.filter((i) => i.domain === item.domain);
    const domainTheta = domainResponses.length >= 2
      ? estimateTheta(domainItems, domainResponses, config)
      : newTheta;

    newDomainThetas[item.domain] = {
      theta: domainTheta,
      count: (state.domainThetas[item.domain]?.count ?? 0) + 1,
    };
  }

  return {
    theta: newTheta,
    standardError: newSE,
    responses: newResponses,
    administeredItemIds: newAdministered,
    domainThetas: newDomainThetas,
  };
}

/**
 * Convert theta (-4 to +4) to a 0-1 domain mastery score
 */
export function thetaToMastery(theta: number): number {
  // Logistic mapping: maps theta in [-4,4] to roughly [0,1]
  return 1 / (1 + Math.exp(-theta));
}

/**
 * Compute final domain scores from IRT state
 */
export function computeDomainScores(state: IrtState): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const [domain, data] of Object.entries(state.domainThetas)) {
    scores[domain] = thetaToMastery(data.theta);
  }
  // Also include global score
  scores["OVERALL"] = thetaToMastery(state.theta);
  return scores;
}

/**
 * Calculate assessment progress as a percentage
 */
export function assessmentProgress(state: IrtState, config: IrtConfig = DEFAULT_CONFIG): number {
  // Progress is driven by both question count and SE convergence
  const countProgress = (state.responses.length / config.maxItems) * 100;
  const seProgress = state.standardError < config.seThreshold
    ? 100
    : Math.min(90, (1 - (state.standardError - config.seThreshold) / (10 - config.seThreshold)) * 90);
  return Math.min(100, Math.max(countProgress, seProgress));
}
