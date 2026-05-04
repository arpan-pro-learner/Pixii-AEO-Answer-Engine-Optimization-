import { NextResponse } from 'next/server';
import { extractAEOData } from '@/lib/aeo-extractor';
import { generateAEOInsights } from '@/lib/aeo-insights';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434';
const OLLAMA_API_KEY = process.env.CLOUD_API_KEY || process.env.OLLAMA_API_KEY || '';

const AGENT_CONFIGS = {
  general: {
    name: 'General Buyer',
    systemPrompt: 'You are a general consumer looking for the best overall product. You value brand reputation, high review counts, and general utility. Suggest products that are widely considered the "gold standard" for the query.',
    model: 'gemma4:31b-cloud',
  },
  health: {
    name: 'Health Expert',
    systemPrompt: 'You are a certified health and wellness expert. You analyze products based on ingredient purity, scientific certifications, health benefits, and safety. Ignore popularity; focus on nutritional/medical superiority.',
    model: 'gemma4:31b-cloud',
  },
  budget: {
    name: 'Price-conscious Buyer',
    systemPrompt: 'You are a budget-focused shopper. You look for the best "bang for your buck". Focus on cost-per-use, current discounts, longevity, and value-oriented alternatives that perform nearly as well as premium options.',
    model: 'gemma4:31b-cloud',
  },
};

/**
 * Attempts to extract valid JSON from a potentially messy model response.
 */
function extractJSON(raw: string): { recommendations: string[]; hooks: string[]; reasoning: string } {
  const cleanRaw = raw.trim();
  const normalize = (obj: any) => ({
    recommendations: Array.isArray(obj.recommendations) ? obj.recommendations : (Array.isArray(obj.products) ? obj.products : []),
    hooks: Array.isArray(obj.hooks) ? obj.hooks : (Array.isArray(obj.patterns) ? obj.patterns : []),
    reasoning: typeof obj.reasoning === 'string' ? obj.reasoning : (typeof obj.explanation === 'string' ? obj.explanation : ''),
  });

  try { return normalize(JSON.parse(cleanRaw)); } catch { /* continue */ }
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonBlockMatch) {
    try { return normalize(JSON.parse(jsonBlockMatch[1].trim())); } catch { /* continue */ }
  }
  const startBrace = raw.indexOf('{');
  const endBrace = raw.lastIndexOf('}');
  if (startBrace !== -1 && endBrace !== -1 && endBrace > startBrace) {
    try { return normalize(JSON.parse(raw.substring(startBrace, endBrace + 1))); } catch { /* continue */ }
  }
  const recommendationLines = raw.match(/^[*-]\s*(.*)$/gm);
  return {
    recommendations: recommendationLines ? recommendationLines.map(l => l.replace(/^[*-]\s*/, '').trim()).slice(0, 5) : [],
    hooks: [],
    reasoning: raw.replace(/[\[\]\{\}"']/g, '').slice(0, 500) || 'Strategic analysis completed.',
  };
}

export const maxDuration = 60;

async function callOllamaAgent(agentId: string, config: { name: string; systemPrompt: string; model: string }, query: string) {
  const prompt = `Search Query: ${query}\n\nProvide analysis as a ${config.name}. Return EXACT JSON:\n{\n  "recommendations": ["P1", "P2", "P3", "P4", "P5"],\n  "hooks": ["H1", "H2", "H3"],\n  "reasoning": "logic"\n}`;

  const cleanBaseUrl = OLLAMA_BASE_URL.replace(/\/$/, '');
  const isRemote = !cleanBaseUrl.includes('localhost') && !cleanBaseUrl.includes('127.0.0.1');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000); 

    let response;
    
    if (isRemote) {
      // OFFICIAL OLLAMA CLOUD PATH
      console.log(`[AEO] Calling Ollama Cloud for ${agentId} (${config.model})`);
      response = await fetch('https://api.ollama.com/v1/chat/completions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${OLLAMA_API_KEY}` 
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: config.systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: false,
          temperature: 0.1
        }),
        signal: controller.signal
      });
    } else {
      // LOCAL OLLAMA PATH
      console.log(`[AEO] Calling Local Ollama for ${agentId} to ${cleanBaseUrl}`);
      response = await fetch(`${cleanBaseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          model: config.model, 
          prompt: `System: ${config.systemPrompt}\n\n${prompt}`, 
          stream: false 
        }),
        signal: controller.signal
      });
    }

    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upstream Error (${response.status}): ${errorText.slice(0, 100)}`);
    }

    const data = await response.json();
    const rawOutput = isRemote ? (data.choices?.[0]?.message?.content || '') : (data.response || '');
    
    return { id: agentId, name: config.name, modelUsed: config.model, content: extractJSON(rawOutput) };

  } catch (err: any) {
    console.error(`[AEO] API failure for ${agentId}:`, err.message);
    return {
      id: agentId,
      name: config.name,
      modelUsed: config.model,
      error: err.message,
      content: { recommendations: [], hooks: [], reasoning: `Intelligence generation failed: ${err.message}` }
    };
  }
}

export async function POST(req: Request) {
  try {
    const { query, url } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    console.log(`[AEO] Starting analysis for query: "${query}" using Ollama at ${OLLAMA_BASE_URL}`);

    // Run agent calls in PARALLEL to massively speed up the user experience
    const agentCalls = Object.entries(AGENT_CONFIGS).map(([id, config]) =>
      callOllamaAgent(id, config, query)
    );

    const results = await Promise.all(agentCalls);

    // Transform array results back to a keyed object for the frontend
    const aggregatedResults = results.reduce((acc, res) => {
      if (!res) return acc;
      const key = Object.keys(AGENT_CONFIGS).find(
        k => AGENT_CONFIGS[k as keyof typeof AGENT_CONFIGS].name === res.name
      );
      if (key) acc[key] = res;
      return acc;
    }, {} as Record<string, any>);

    // EXTRACT AEO DATA
    const aeoData = extractAEOData(aggregatedResults);

    // GENERATE INSIGHTS
    const insights = generateAEOInsights(url, aggregatedResults, aeoData);

    console.log(`[AEO] Analysis complete. Score: ${insights.visibilityScore}, Competitors: ${aeoData.topCompetitors.length}`);

    return NextResponse.json({
      agents: aggregatedResults,
      aeoData,
      insights,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[AEO] API Route Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
