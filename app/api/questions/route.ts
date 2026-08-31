import { NextRequest, NextResponse } from "next/server";
import questionsDb from "@/lib/game-data/questions-db.json";
import { getGameContent } from "@/lib/game-data/questions";
import { generateKMKQuestions, KMKGender, KMKCategory } from "@/lib/game-data/kmk-generator";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId") || "never-have-i-ever";
    const mature = searchParams.get("mature") === "true";
    const mode = (searchParams.get("mode") || "standard") as "standard" | "challenge" | "spicy";
    const useAI = searchParams.get("ai") === "true";
    const kmkGender = (searchParams.get("kmkGender") || "female") as KMKGender;
    const kmkCategory = (searchParams.get("kmkCategory") || "all") as KMKCategory;

    // Load static database
    let questions: string[] = [];

    if (gameId === "kiss-marry-kill") {
      questions = generateKMKQuestions(kmkGender, kmkCategory, 50);
    } else {
      const db = questionsDb as Record<string, Record<string, string[]>>;
      if (db[gameId]) {
        const selectedMode = mature ? mode : "standard";
        questions = db[gameId][selectedMode] || db[gameId].standard || [];
      }
      if (questions.length === 0) {
        questions = getGameContent(gameId, mature, mode);
      }
    }

    // Call Groq API if AI is requested and we have the API key
    const apiKey = process.env.GROQ_API_KEY;
    if (useAI && apiKey) {
      try {
        const aiQuestions = await generateQuestionsWithAI(apiKey, gameId, mode, mature, kmkGender, kmkCategory);
        if (aiQuestions && aiQuestions.length > 0) {
          questions = [...aiQuestions, ...questions];
        }
      } catch (aiError) {
        console.error("Failed to generate questions using Groq API:", aiError);
      }
    }

    // Shuffle questions to avoid repetition
    questions = questions.sort(() => Math.random() - 0.5);

    // Limit returned questions to 100 to keep responses lightweight
    const limit = parseInt(searchParams.get("limit") || "100", 10);
    const slicedQuestions = questions.slice(0, limit);

    return NextResponse.json({
      success: true,
      gameId,
      mode,
      mature,
      questions: slicedQuestions,
      totalAvailable: questions.length,
      source: useAI && apiKey ? "groq-ai" : "local-db"
    });
  } catch (error: any) {
    console.error("Error in /api/questions API route:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Function to call Groq API
async function generateQuestionsWithAI(
  apiKey: string,
  gameId: string,
  mode: string,
  mature: boolean,
  kmkGender: KMKGender = "female",
  kmkCategory: KMKCategory = "all"
): Promise<string[]> {
  let themes = "fun, lighthearted, social, secrets, embarrassing moments, funny habits";
  if (mature) {
    if (mode === "challenge") {
      themes = "relationships, romance, dating history, crushes, mild secrets, flirting";
    } else if (mode === "spicy") {
      themes = "consensual adult fantasies, kinks, intimacy, dirty secrets, bedroom preferences, edgy hypotheticals, pure debauchery, physical attraction";
    }
  }

  let formatGuide = "";
  switch (gameId) {
    case "never-have-i-ever":
      formatGuide = "Each question must start with 'Never have I ever...' and state a confession.";
      break;
    case "truth-or-dare":
      formatGuide = "Format each option as either 'Truth: [question]' or 'Dare: [action/challenge]'. Generate an equal mix of Truths and Dares.";
      break;
    case "whos-most-likely":
      formatGuide = "Each question must start with 'Who is most likely to...' and state a scenario.";
      break;
    case "would-you-rather":
      formatGuide = "Each question must start with 'Would you rather [Option A] or [Option B]?' and represent a difficult choice.";
      break;
    case "if-you-had-to":
      formatGuide = "Each question must start with 'If you had to [hypothetical situation], [question/choice]?'";
      break;
    case "drink-if":
      formatGuide = "Each question must start with 'Drink if...' followed by a condition.";
      break;
    case "hot-seat":
      formatGuide = "Generate deep, probing questions suitable for interviewing a single player in the 'Hot Seat'.";
      break;
    case "paranoia":
      formatGuide = "Generate whispered, comparison questions about the players in the room, e.g. 'Who in this room is [trait]?' or 'Who has [trait]?'";
      break;
    case "kiss-marry-kill":
      const genderDesc = kmkGender === "female" ? "famous female actresses, pop stars, models, or adult stars" : kmkGender === "male" ? "famous male actors, musicians, or celebrities" : "a mix of famous male and female celebrities";
      const catDesc = kmkCategory === "bollywood" ? "strictly Bollywood / Indian cinema stars" : kmkCategory === "hollywood" ? "Hollywood A-listers" : kmkCategory === "popstars" ? "global pop stars and musicians" : kmkCategory === "adultstars" ? "famous adult movie stars and models" : kmkCategory === "fantasy" ? "popular anime and fantasy characters" : "popular global and Indian celebrities";
      formatGuide = `Each question MUST select 3 distinct famous figures from ${catDesc} (${genderDesc}), formatted as 'Choose between: [Option A], [Option B], and [Option C] for Kiss, Marry, and Kill.'`;
      break;
    case "rapid-fire":
      formatGuide = "Generate rapid comparison options formatted as '[Option A] or [Option B]? Answer in 1 second.'";
      break;
    case "strip-or-sip":
      formatGuide = "Format each question as 'Take [X] sips or [funny/daring action]' or 'Take a shot or [spicy action].'";
      break;
    default:
      formatGuide = "Generate engaging, direct questions or actions suitable for a party game.";
  }

  const prompt = `
    You are an expert party game designer for "Stir It Up", an adult/social party game.
    Generate exactly 15 unique, high-quality, and highly engaging game prompts.
    
    Game type: "${gameId}"
    Mode/Category: "${mode}" (mature Content is ${mature ? "enabled" : "disabled"})
    Target themes: ${themes}
    Format requirement: ${formatGuide}
    
    ${mature ? "CRITICAL: Emphasize highly playful, adult, and provocative topics. Keep it within the realm of fun, spicy, relationships, consenting kinks, fantasies, and consensual adult themes. Make it edgy, taboo, and pure debauchery as appropriate for spicy mode, but always consensual and safe." : "Keep it family-friendly, social, and safe for all ages."}
    
    Response format:
    You MUST respond with a valid JSON object containing a single key "questions" mapping to a list of 15 strings.
    Example:
    {
      "questions": [
        "Prompt 1...",
        "Prompt 2...",
        "Prompt 3..."
      ]
    }
    
    Do NOT include any markdown code block syntax (like \`\`\`json) or conversational text. Return ONLY the JSON object.
  `;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: "You are a party game content engine. You output valid JSON objects only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.9,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API returned status ${response.status}: ${errorText}`);
  }

  const result = await response.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq API");
  }

  const parsed = JSON.parse(content.trim());
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error("Invalid response format from Groq: 'questions' key is missing or not an array");
  }

  return parsed.questions;
}
