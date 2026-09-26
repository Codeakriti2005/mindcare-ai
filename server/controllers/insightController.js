const { Ollama } = require("ollama");
const Mood = require("../models/Mood");

const ollama = new Ollama({
  host: "http://127.0.0.1:11434",
});

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

    const response = await ollama.chat({
      model: "llama3.2:3b",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const insight = response.message?.content?.trim();

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