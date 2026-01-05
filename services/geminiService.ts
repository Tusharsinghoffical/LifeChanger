
import { GoogleGenAI, Type } from "@google/genai";
import { Habit } from "../types";

export const getHabitInsights = async (habits: Habit[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const habitsSummary = habits.map(h => ({
    name: h.name,
    category: h.category,
    completionsCount: h.completedDates.length,
    recentDays: h.completedDates.slice(-7)
  }));

  const prompt = `
    You are a mindful life coach and habit transformation expert.

    I am using a daily life & habit tracking app called "Life Changer" to improve my
    health, discipline, mindset, and overall quality of life.

    Here is my habit progress data:
    ${JSON.stringify(habitsSummary, null, 2)}

    Your task:
    Analyze my habits deeply like a real human coach, not a generic AI.

    Please provide the response in VALID JSON format with the following goals:

    1. **Life Insight**
       - Give a powerful but realistic insight about my current lifestyle.
       - Focus on long-term life improvement, self-discipline, health, and mental strength.
       - Keep it motivating but honest (no fake positivity).

    2. **Personalized Improvement Suggestion**
       - Give ONE very specific and actionable suggestion based on my habit patterns.
       - It should be easy to apply in daily life (today or tomorrow).
       - If inconsistency is visible, guide me gently toward stability.

    3. **Mindful Zen Quote**
       - A short, calm, meaningful quote related to habits, growth, or inner peace.
       - It should feel soothing, wise, and encouraging — not cheesy.

    Tone & Style Rules:
    - Calm, supportive, and life-coach-like
    - Simple language, emotionally intelligent
    - No emojis
    - No extra explanation outside JSON

    JSON Response Format:
    {
      "insight": "string",
      "suggestion": "string",
      "quote": "string"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insight: { type: Type.STRING },
            suggestion: { type: Type.STRING },
            quote: { type: Type.STRING }
          },
          required: ["insight", "suggestion", "quote"]
        }
      }
    });

    const jsonStr = response.text?.trim() || '{}';
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return {
      insight: "Consistency is the key to life-changing results. You're building the foundation.",
      suggestion: "Pick your most important habit and commit to a 3-day streak starting today.",
      quote: "Success is the sum of small efforts, repeated day in and day out."
    };
  }
};
