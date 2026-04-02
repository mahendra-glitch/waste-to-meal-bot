export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    try {
        // This line handles both string and object inputs safely
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isLazy } = body;

        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Cook something with: ${ingredients}. Lazy: ${isLazy}` }] }]
            })
        });

        const data = await response.json();
        
        // Log the response to Vercel Logs so we can see what Google said
        console.log("Gemini Response:", JSON.stringify(data));

        res.status(200).json(data);
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: error.message });
    }
}
