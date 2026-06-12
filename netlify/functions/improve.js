const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are an expert CV writer and ATS optimization specialist.
Your job is to rewrite a CV to better match a job description, then rescore it.
Never fabricate experience — only reframe what already exists.
Always respond with valid JSON only — no markdown, no preamble.`;

const IMPROVE_PROMPT = (jd, cvText, originalScore, originalCategories) => `
Rewrite this CV to better match the job description.
Apply ATS improvements: add missing keywords, reframe experience descriptions, update the summary.
Never fabricate experience — only reframe what exists.

ORIGINAL SCORE: ${originalScore}/100
ORIGINAL CATEGORIES: ${JSON.stringify(originalCategories)}

JOB DESCRIPTION:
${jd}

ORIGINAL CV TEXT:
${cvText}

Respond ONLY with this exact JSON structure (no markdown, no backticks):
{
  "updatedCV": "<full rewritten CV text>",
  "newScore": <number 0-100>,
  "verdict": "<Strong Match|Moderate Match|Partial Match|Weak Match>",
  "categories": [
    { "name": "Core experience", "score": <0-100> },
    { "name": "Keyword match", "score": <0-100> },
    { "name": "Client services", "score": <0-100> },
    { "name": "Compliance & legal", "score": <0-100> },
    { "name": "Global/domain mobility", "score": <0-100> },
    { "name": "Education & certs", "score": <0-100> }
  ],
  "closedGaps": ["<keyword that was a gap, now addressed>"],
  "improvements": ["<description of what changed>"]
}`;

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method Not Allowed" };
  }

  try {
    const { jobDescription, cvText, originalScore, originalCategories } = JSON.parse(event.body);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const result = await model.generateContent({
      contents: [{
        role: "user",
        parts: [{ text: IMPROVE_PROMPT(jobDescription, cvText, originalScore, originalCategories) }],
      }],
    });

    const text = result.response.text().trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    console.error("Gemini improve error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
