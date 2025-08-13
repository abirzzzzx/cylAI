export default async function handler(req, res) {
  try {
    const { messages } = await req.body;
    const r = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": req.headers.referer || "http://localhost",
        "X-Title": "Abz Chatbot"
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages
      })
    });
    const data = await r.json();
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
