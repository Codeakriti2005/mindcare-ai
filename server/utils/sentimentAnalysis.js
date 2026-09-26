const { Ollama } = require("ollama");

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

// Allowed sentiment values
const ALLOWED_SENTIMENTS = [
  "positive",
  "neutral",
  "negative",
];

// Maximum text length for sentiment analysis
const MAX_TEXT_LENGTH = 5000;

const analyzeSentiment = async (text) => {
  try {
    // ================= INPUT VALIDATION =================

    if (!text || typeof text !== "string") {
      return "unknown";
    }

    const cleanText = text.trim();

    if (!cleanText) {
      return "unknown";
    }

    // Journal model already has a 5000 character limit,
    // but this helper also protects itself independently.
    if (cleanText.length > MAX_TEXT_LENGTH) {
      return "unknown";
    }

    // ================= OLLAMA REQUEST =================

    const response = await ollama.chat({
      model: "llama3.2:3b",

      messages: [
        {
          role: "system",
          content: `
You are a sentiment classification system for MindCare AI.

Classify the user's journal entry into exactly ONE category.

Allowed categories:
positive
neutral
negative

Rules:
- Return ONLY one allowed category.
- Do not explain your answer.
- Do not provide advice.
- Do not diagnose the user.
- Do not infer a mental health condition.
- Focus only on the overall emotional sentiment expressed in the text.
          `.trim(),
        },

        {
          role: "user",
          content: cleanText,
        },
      ],
    });

    // ================= RESPONSE EXTRACTION =================

    const rawSentiment =
      response?.message?.content;

    if (
      !rawSentiment ||
      typeof rawSentiment !== "string"
    ) {
      return "unknown";
    }

    // ================= RESPONSE NORMALIZATION =================

    const sentiment = rawSentiment
      .trim()
      .toLowerCase()
      .replace(/[.!?,:;"'`]/g, "")
      .trim();

    // ================= VALIDATION =================

    if (ALLOWED_SENTIMENTS.includes(sentiment)) {
      return sentiment;
    }

    return "unknown";
  } catch (error) {
    console.error(
      "Sentiment Analysis Error:",
      error.message
    );

    // AI failure should never prevent
    // the journal from being saved.
    return "unknown";
  }
};

module.exports = analyzeSentiment;