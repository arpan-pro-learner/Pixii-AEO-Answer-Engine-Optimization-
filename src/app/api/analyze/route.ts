import { NextResponse } from 'next/server';
import { extractAEOData } from '@/lib/aeo-extractor';
import { generateAEOInsights } from '@/lib/aeo-insights';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const maxDuration = 60;

const AGENT_CONFIGS = {
  general: {
    name: 'General Buyer',
    systemPrompt: 'You are a general consumer looking for the best overall product. You value brand reputation, high review counts, and general utility. Your goal is to identify current "market dominators".',
    model: 'gemini-3.1-flash',
  },
  health: {
    name: 'Health Expert',
    systemPrompt: 'You are a certified health and wellness expert. You analyze products based on ingredient purity, certifications, and safety. You prioritize scientific superiority over popularity.',
    model: 'gemini-3.1-flash',
  },
  budget: {
    name: 'Price-conscious Buyer',
    systemPrompt: 'You are a budget-focused shopper. You look for the best "bang for your buck", longevity, and high resale value.',
    model: 'gemini-3.1-flash',
  },
};

// Define Schema for guaranteed JSON output without strict length validation errors
const AEOResultSchema = z.object({
  recommendations: z.array(z.string()).describe('Top 5 products (keep item brief, max 10 words)'),
  hooks: z.array(z.string()).describe('Top 3 strategic hooks (keep item brief, max 20 words)'),
  reasoning: z.string().describe('Explain if the target URL is a good fit. (Keep brief, max 50 words)')
});

async function callGeminiAgent(agentId: string, config: { name: string; systemPrompt: string; model: string }, query: string, targetUrl: string) {
  try {
    console.log(`[AEO] Calling Gemini for ${agentId} with URL: ${targetUrl || 'None'}`);
    
    const { object } = await generateObject({
      model: google(config.model),
      system: config.systemPrompt + " Keep all responses brief and objective. Focus on data.",
      prompt: `Search Query: "${query}"\nTarget Product URL: "${targetUrl || 'No URL provided'}"\n\nTask: Analyze if the Target Product is a valid and competitive answer for the Query. If it is NOT a fit (e.g. searching for Windows but the URL is for Mac), ensure the reasoning reflects this mismatch.`,
      schema: AEOResultSchema,
    });

    return {
      id: agentId,
      name: config.name,
      modelUsed: config.model,
      content: object
    };
  } catch (err: any) {
    console.error(`[AEO] Gemini/Validation error for ${agentId}:`, err);
    return {
      id: agentId,
      name: config.name,
      modelUsed: config.model,
      error: err.message,
      content: { recommendations: [], hooks: [], reasoning: `Intelligence offline (Error: ${err.message.slice(0, 50)})` }
    };
  }
}

export async function POST(req: Request) {
  try {
    const { query, url } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log(`[AEO] Running 3 analysis agents sequentially to respect API rate limits...`);

    const aggregatedResults: Record<string, any> = {};
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const [id, config] of Object.entries(AGENT_CONFIGS)) {
      const result = await callGeminiAgent(id, config, query, url);
      aggregatedResults[id] = result;
      // Small pause to be "polite" to the Google Free Tier anti-burst filter
      await delay(800); 
    }

    // EXTRACT AEO DATA & GENERATE INSIGHTS
    const aeoData = extractAEOData(aggregatedResults);
    const insights = generateAEOInsights(url, aggregatedResults, aeoData);

    return NextResponse.json({
      agents: aggregatedResults,
      aeoData,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AEO] Critical API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
