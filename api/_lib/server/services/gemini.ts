import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY or GOOGLE_API_KEY must be set");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface PetMatchRequest {
  userPreferences: {
    petType?: string;
    livingSpace: string;
    activityLevel: string;
    experience: string;
    timeAvailable: string;
    familySituation: string;
    budget?: string;
    allergies?: string;
  };
  availablePets: Array<{
    id: number;
    name: string;
    type: string;
    breed: string;
    age: string;
    personality: any;
    careNeeds: any;
    description: string;
  }>;
}

export interface PetMatchResult {
  petId: number;
  matchScore: number;
  reasoning: string;
  careAdvice: string[];
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  async findPetMatches(request: PetMatchRequest): Promise<PetMatchResult[]> {
    const prompt = this.buildMatchingPrompt(request);
    
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Remove Markdown code block if present
      const cleaned = text.replace(/```json|```/g, "").trim();
      const matches = JSON.parse(cleaned);
      return matches;
    } catch (error) {
      console.error("Error generating pet matches:", error);
      throw new Error("Failed to generate pet matches");
    }
  }

  async getChatResponse(message: string, chatHistory: any[] = []): Promise<string> {
    const contextPrompt = `You are a friendly AI assistant for FurryFriends, a pet adoption website. 
    You help users find their perfect pet companions by asking about their lifestyle, preferences, and providing advice.
    Be warm, encouraging, and helpful. Focus on pet adoption, care, and matching.
    
    Chat history: ${JSON.stringify(chatHistory)}
    
    User message: ${message}
    
    Respond helpfully and ask relevant follow-up questions if needed.`;

    try {
      const result = await this.model.generateContent(contextPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Error generating chat response:", error);
      throw new Error("Failed to generate chat response");
    }
  }

  async generatePetCareAdvice(petType: string, specificNeeds?: string): Promise<string[]> {
    const prompt = `Generate 5-7 specific, actionable pet care tips for a ${petType}${
      specificNeeds ? ` with these specific needs: ${specificNeeds}` : ""
    }.
    
    Return as a JSON array of strings. Each tip should be practical and helpful for new pet owners.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const tips = JSON.parse(text);
      return tips;
    } catch (error) {
      console.error("Error generating care advice:", error);
      return [
        "Provide fresh water daily",
        "Maintain a consistent feeding schedule",
        "Schedule regular veterinary checkups",
        "Ensure proper exercise and mental stimulation",
        "Create a safe, comfortable living environment"
      ];
    }
  }

  private buildMatchingPrompt(request: PetMatchRequest): string {
    return `You are an expert pet matchmaker AI. Analyze the user's preferences and lifestyle to match them with suitable pets.

User Preferences:
- Living Space: ${request.userPreferences.livingSpace}
- Activity Level: ${request.userPreferences.activityLevel}
- Experience: ${request.userPreferences.experience}
- Time Available: ${request.userPreferences.timeAvailable}
- Family Situation: ${request.userPreferences.familySituation}
- Pet Type Preference: ${request.userPreferences.petType || "any"}
- Budget: ${request.userPreferences.budget || "not specified"}
- Allergies: ${request.userPreferences.allergies || "none"}

Available Pets:
${JSON.stringify(request.availablePets, null, 2)}

Analyze each pet and provide a compatibility score (1-100) with detailed reasoning. Consider:
1. Living space compatibility
2. Exercise and activity needs
3. Care requirements vs user experience
4. Time commitment
5. Personality match
6. Special needs or considerations

Return a JSON array of matches with this exact format:
[
  {
    "petId": number,
    "matchScore": number (1-100),
    "reasoning": "Detailed explanation of why this pet is a good/poor match",
    "careAdvice": ["tip1", "tip2", "tip3"] (3-5 specific care tips for this pet)
  }
]

Only include pets with a match score of 60 or higher. Sort by match score descending.`;
  }
}

export const geminiService = new GeminiService();
