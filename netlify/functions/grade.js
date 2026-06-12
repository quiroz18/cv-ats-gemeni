const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_INSTRUCTION = `You are an expert ATS (Applicant Tracking System) analyst and CV consultant.
Your job is to score a CV against a job description across 6 categories (0-100 each), identify keyword hits and gaps, list strengths and weaknesses, and provide numbered improvement recommendations.
Always respond with valid JSON only — no markdown, no preamble, no explanation outside the JSON.`;

const GRADE_PROMPT = (jd, cvText) => `
Analyze this CV against the job description.

JOB DESCRIPTION:
${jd}

CV TEXT:
${cvText}

Respond ONLY with this exact JSON structure (no markdown, no backticks):
{
  "overallScore": <number 0-100>,
  "verdict": "<Strong Match|Moderate Match|Partial Match|Weak Match>",
  "categories": [
    { "name": "Core experience", "score": <0-100> },
    { "name": "Keyword match", "score": <0-100> },
    { "name": "Client services", "score": <0-100> },
    { "name": "Compliance & legal", "score": <0-100> },
    { "name": "Global/domain mobility", "score": <0-100> },
    { "name": "Education & certs", "score": <0-100> }
  ],
  "keywordHits": ["<keyword>"],
  "keywordGaps": ["<keyword>"],
  "strengths": ["<strength description>"],
  "gaps": ["<gap description>"],
  "recommendations": ["<numbered recommendation>"]
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
    const { jobDescription, cvText, cvBase64 } = JSON.parse(event.body);

    if (!jobDescription) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: "Job description is required" }) };
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    let parts;

    if (cvBase64) {
      // Pass PDF inline to Gemini
      parts = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: cvBase64,
          },
        },
        { text: GRADE_PROMPT(jobDescription, "") },
      ];
    } else {
      parts = [{ text: GRADE_PROMPT(jobDescription, cvText || "") }];
    }

    const result = await model.generateContent({ contents: [{ role: "user", parts }] });
    const text = result.response.text().trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    console.error("Gemini grade error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
