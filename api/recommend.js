// Vercel serverless function — keeps the Groq API key server-side only.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { query, products } = req.body;

  if (!query || !products) {
    return res.status(400).json({ error: "Missing query or products" });
  }

  console.log("Available env keys:", Object.keys(process.env).filter(k => k.includes("API") || k.includes("GROQ")));
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing GROQ_API_KEY. Available keys: " + Object.keys(process.env).filter(k => !k.startsWith("npm_") && !k.startsWith("NODE_")).join(", ") });
  }

  const productList = products
    .map((p) => `ID:${p.id} | ${p.name} | ${p.category} | $${p.price} | ${p.description}`)
    .join("\n");

  const prompt = `You are a product recommendation assistant. Here is the product catalog:\n${productList}\n\nUser preference: "${query}"\n\nReturn ONLY a JSON array of the matching product IDs (numbers), ranked by relevance, e.g. [3,1,5]. No explanation, no markdown, just the array.`;

  try {
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-120b",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
    });

    if (!groqResponse.ok) {
      const errData = await groqResponse.json().catch(() => ({}));
      return res.status(groqResponse.status).json({
        error: errData?.error?.message || "Groq API request failed",
      });
    }

    const data = await groqResponse.json();
    const text = data.choices[0].message.content.trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const ids = JSON.parse(cleaned);

    return res.status(200).json({ ids });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Something went wrong" });
  }
}
