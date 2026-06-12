const https = require("https");

const SYSTEM_INSTRUCTION = `You are an expert ATS analyst and CV consultant. Score a CV against a job description across 6 categories (0-100 each), identify keyword hits and gaps, list strengths and weaknesses, and provide numbered improvement recommendations. Always respond with valid JSON only — no markdown, no preamble.`;

const GRADE_PROMPT = (jd, cvText) => `${SYSTEM_INSTRUCTION}

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

function callGemini(apiKey, prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 2000 }
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.error) return reject(new Error(json.error.message));
          const text = json.candidates[0].content.parts[0].text;
          resolve(text);
        } catch (e) {
          reject(new Error("Failed to parse Gemini response: " + data));
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method Not Allowed" };

  try {
    const { jobDescription, cvText } = JSON.parse(event.body);
    if (!jobDescription) return { statusCode: 400, headers, body: JSON.stringify({ error: "Job description is required" }) };

    const apiKey = process.env.GEMINI_API_KEY;
    const prompt = GRADE_PROMPT(jobDescription, cvText || "");
    const text = await callGemini(apiKey, prompt);
    const clean = text.trim().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    console.error("Grade error:", err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
