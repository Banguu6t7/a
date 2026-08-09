export interface AIProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

export interface AIResponse {
  content: string;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

export class AIProvider {
  private config: AIProviderConfig;
  constructor(config: AIProviderConfig) { this.config = config; }

  static fromEnv(): AIProvider | null {
    const apiKey = process.env.AI_API_KEY;
    const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
    const model = process.env.AI_MODEL || "gpt-4o-mini";
    if (!apiKey) return null;
    return new AIProvider({ apiKey, baseUrl, model });
  }

  static isConfigured(): boolean {
    return !!process.env.AI_API_KEY;
  }

  async analyze(prompt: string): Promise<AIResponse> {
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: "system", content: "You are an expert code reviewer. Analyze the provided code and return findings in strict JSON format. Each finding must have: id, severity (critical|high|medium|low|info), category (security|bug|performance|quality|maintainability), title, description, file, lineStart, lineEnd, recommendation, suggestedFix, confidence (0-1)." },
          { role: "user", content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 4000,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AI API error: ${response.status} - ${error}`);
    }
    const data = await response.json();
    return { content: data.choices[0]?.message?.content || "", usage: data.usage };
  }
}
