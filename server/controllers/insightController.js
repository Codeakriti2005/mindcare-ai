const { Ollama } = require("ollama");
const Mood = require("../models/Mood");

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

const CLOUDFLARE_MODEL = "@cf/meta/llama-3.2-3b-instruct";

const isProductionAI = () => {
  return Boolean(
    process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.CLOUDFLARE_API_TOKEN
  );
};

const generateWithOllama = async (prompt) => {
  console.log("Wellness AI Provider: Local Ollama");

  const response = await ollama.chat({
    model: "llama3.2:3b",
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return response.message?.content?.trim();
};

const generateWithCloudflare = async (prompt) => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare AI credentials are missing.");
  }

  console.log("Wellness AI Provider: Cloudflare Workers AI");

  const url =
    `https://api.cloudflare.com/client/v4/accounts/` +
    `${accountId}/ai/run/${CLOUDFLARE_MODEL}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 300,
      temperature: 0.5,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(
      "Cloudflare Wellness AI Error:",
      JSON.stringify(data.errors || data)
    );

    throw new Error(
      `Cloudflare Wellness AI request failed with status ${response.status}`
    );
  }

  return data.result?.response?.trim();
};

const generateWellnessInsight = async (prompt) => {
  if (isProductionAI()) {
    return generateWithCloudflare(prompt);
  }

  return generateWithOllama(prompt);
};

const getWellnessInsights = async (req, res) => {
  try {
    const moods = await Mood.find({
      user: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .limit(14);

    if (moods.length === 0) {
      return res.status(200).json({
        insight:
          "Start adding a few mood check-ins and I'll help you notice your wellness patterns.",
      });
    }

    const moodSummary = moods.map((item) => ({
      mood: item.mood,
      date: item.createdAt,
    }));

    const prompt = `
You are a supportive wellness companion.

Analyze the user's recent mood check-ins below.

Mood data:
${JSON.stringify(moodSummary)}

Give a short, supportive wellness insight.

Rules:
- Do NOT diagnose any mental health condition.
- Do NOT claim to be a doctor or therapist.
- Do NOT make medical claims.
- Do NOT predict the user's future.
- Do NOT use alarming language.
- Be empathetic and encouraging.
- Mention a pattern only if the data reasonably supports it.
- Suggest one simple, practical wellness activity.
- Keep the response between 60 and 100 words.
- Return plain text only.
`;

    const insight = await generateWellnessInsight(prompt);

    res.status(200).json({
      insight:
        insight ||
        "Keep checking in with yourself. Small, consistent steps can help you understand your wellness patterns.",
    });
  } catch (error) {
    console.error("Wellness Insights Error:", error.message);

    res.status(500).json({
      message: "Unable to generate wellness insights",
    });
  }
};

module.exports = {
  getWellnessInsights,
};