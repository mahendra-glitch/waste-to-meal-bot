export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isLazy } = data;
        
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: "Gemini API Key missing in Vercel Settings" });
        }

        // Updated to v1 (Stable) and specific model name
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a professional zero-waste chef for "Eco Chef". 
                        Create a recipe using only: ${ingredients}. 
                        ${isLazy ? "The recipe MUST be 'Lazy Mode': under 15 minutes." : ""} 
                        Return clean HTML: <h3>Title</h3><br><b>Ingredients:</b><ul><li>item</li></ul><b>Steps:</b><ol><li>step</li></ol>`
                    }]
                }]
            })
        });

        const result = await response.json();

        if (result.error) {
            // This will help you see the specific Google error in your browser console
            return res.status(response.status).json({ error: result.error.message });
        }

        const recipeText = result.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: recipeText });

    } catch (error) {
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
