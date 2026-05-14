export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isLazy } = data;
        
        const GEMINI_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_KEY) {
            return res.status(500).json({ error: "Gemini API Key missing in Vercel Settings" });
        }

        // Switching to v1beta, which has the widest support for Flash models
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

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

        // Improved error catching to see exactly what Google says
        if (result.error) {
            console.error("Google API Error:", result.error);
            return res.status(400).json({ error: result.error.message });
        }

        if (!result.candidates || result.candidates.length === 0) {
            return res.status(500).json({ error: "No recipe generated. Check ingredient safety." });
        }

        const recipeText = result.candidates[0].content.parts[0].text;
        return res.status(200).json({ text: recipeText });

    } catch (error) {
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
