export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { ingredients, isLazy } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Professional chef: create a recipe using ${ingredients}. ${isLazy ? "Under 15 mins." : ""} Return HTML.` }] }]
            })
        });

        const data = await response.json();

        // Safety check: Make sure Gemini actually returned a candidate
        if (data.candidates && data.candidates[0]) {
            return res.status(200).json(data);
        } else {
            return res.status(500).json({ error: "Gemini returned an empty response", details: data });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
