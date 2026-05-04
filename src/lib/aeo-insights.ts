import { ExtractionResults, AgentResult } from './aeo-extractor';

export interface AEOInsights {
  visibilityScore: number; // 0 to 100
  isVisible: boolean;
  competitorOverlap: number; // How many top competitors also appeared in the user's context
  missingHooks: string[]; // High-frequency hooks the user doesn't have
  recommendations: string[]; // Concrete steps to improve
}

export function generateAEOInsights(
  userProductUrl: string | null,
  agentsData: Record<string, AgentResult>,
  extraction: ExtractionResults
): AEOInsights {
  // 1. Visibility Check
  // Extract potential brand/product keywords from the URL or Query
  const getKeywords = (str: string) => {
    return str.split(/[\/-_\s]+/)
      .filter(w => w.length > 2)
      .map(w => w.toLowerCase());
  };

  const urlKeywords = userProductUrl ? getKeywords(userProductUrl) : [];
  
  // Check if any agent recommendation contains significant keywords from the user's URL
  const isVisible = extraction.allProducts.some(p => {
    const productLower = p.toLowerCase();
    
    // Explicit keywords from URL match product recommendation
    if (urlKeywords.length > 0 && urlKeywords.some(kw => productLower.includes(kw))) return true;
    
    // Fallback: If any recommendation name (split by spaces) appears in the user provided URL
    const recoWords = productLower.split(' ').filter(w => w.length > 3);
    if (userProductUrl && recoWords.some(w => userProductUrl.toLowerCase().includes(w))) return true;
    
    return false;
  });

  // 2. Heuristic Scoring
  let score = 0;
  if (isVisible) score += 55; // Baseline for visibility

  // Bonus for appearing in multiple agent responses (Resonance)
  const appearanceCount = extraction.topCompetitors.filter(c => {
    const nameLower = c.name.toLowerCase();
    return urlKeywords.some(kw => nameLower.includes(kw));
  }).length;
  
  score += (appearanceCount * 12); 

  // Market context score - if we found ANY relevant data, the score shouldn't be bottom-tier
  if (extraction.allProducts.length > 0) score += 10;
  
  // Small baseline for having a reachable listing
  if (userProductUrl) score += 5;

  const visibilityScore = Math.max(5, Math.min(score, 100));

  // 3. Gap Analysis (Missing Hooks)
  // We identify the top 3 most frequent hooks and suggest them
  const missingHooks = extraction.commonHooks
    .slice(0, 3)
    .map(h => h.hook);

  // 4. Recommendations
  const recommendations = [];
  if (!isVisible) {
    recommendations.push(`Your product is not currently appearing in AI recommendations for this query.`);
    recommendations.push(`Try incorporating high-resonance hooks like: ${missingHooks.join(', ')}.`);
  } else {
    recommendations.push(`Your product is visible! To increase dominance, optimize for the ${extraction.topCompetitors[0]?.name || 'top'} product's positioning.`);
  }

  return {
    visibilityScore,
    isVisible,
    competitorOverlap: appearanceCount,
    missingHooks,
    recommendations,
  };
}
