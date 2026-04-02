export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // Updated way to handle the body for Vercel 2026
        const { ingredients, isLazy } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key missing in Vercel Settings" });
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a chef. Create a recipe with: ${ingredients}. ${isLazy ? "Make it fast." : ""} Format with HTML tags.` }] }]
            })
        });

        const data = await response.json();
        
        // Return the full data to the frontend
        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
