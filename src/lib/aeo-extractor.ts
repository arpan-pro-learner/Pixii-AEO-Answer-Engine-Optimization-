export interface AgentResponse {
  recommendations: string[];
  hooks: string[];
  reasoning: string;
}

export interface AgentResult {
  name: string;
  content: AgentResponse;
}

export interface ExtractionResults {
  topCompetitors: { name: string; count: number }[];
  commonHooks: { hook: string; count: number }[];
  allProducts: string[];
}

export function extractAEOData(agentsData: Record<string, AgentResult>): ExtractionResults {
  const productCounts: Record<string, number> = {};
  const hookCounts: Record<string, number> = {};
  const allProductsSet = new Set<string>();

  Object.values(agentsData).forEach((agent) => {
    // Extract Products
    agent.content?.recommendations?.forEach((product) => {
      const normalizedProd = product.trim().toLowerCase();
      productCounts[normalizedProd] = (productCounts[normalizedProd] || 0) + 1;
      allProductsSet.add(product);
    });

    // Extract Hooks
    agent.content?.hooks?.forEach((hook) => {
      const normalizedHook = hook.trim().toLowerCase();
      hookCounts[normalizedHook] = (hookCounts[normalizedHook] || 0) + 1;
    });
  });

  // Sort and format competitors
  const topCompetitors = Object.entries(productCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Sort and format hooks
  const commonHooks = Object.entries(hookCounts)
    .map(([hook, count]) => ({ hook, count }))
    .sort((a, b) => b.count - a.count);

  return {
    topCompetitors,
    commonHooks,
    allProducts: Array.from(allProductsSet),
  };
}
