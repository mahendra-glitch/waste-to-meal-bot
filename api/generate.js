export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Extract data from the request body
        const { ingredients, isLazy } = req.body;
        const API_KEY = process.env.GEMINI_API_KEY;

        if (!API_KEY) {
            return res.status(500).json({ error: "API Key missing in Vercel Settings" });
        }

        // 3. Call the Gemini API with the corrected model name: gemini-1.5-flash-latest
        // This "-latest" tag is often required in the v1beta sandbox.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `You are a professional chef. Create a recipe using these ingredients: ${ingredients}. 
                        ${isLazy ? "The recipe MUST be fast (under 15 mins) and use minimal equipment." : ""} 
                        Format your response using clean HTML (<h3> for title, <ul> and <li> for steps).` 
                    }] 
                }]
            })
        });

        const data = await response.json();

        // 4. Error check for the API response
        if (data.error) {
            console.error("Gemini API Error:", data.error);
            return res.status(data.error.code || 500).json({ 
                error: "Gemini Error", 
                message: data.error.message 
            });
        }

        // 5. Return the full data to the frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error("Server-side Error:", error);
        return res.status(500).json({ 
            error: "Server Error", 
            message: error.message 
        });
    }
}
