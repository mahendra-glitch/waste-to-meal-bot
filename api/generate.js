export default async function handler(req, res) {
    // 1. Safety Check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // 2. Get data (Adding a fallback in case req.body is a string)
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isLazy } = data;
        
        const API_KEY = process.env.GEMINI_API_KEY;

        // 3. The request to Google
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ 
                        text: `Context: Zero-waste chef. Ingredients: ${ingredients}. ${isLazy ? "Lazy Mode: under 15 mins." : ""} Return instructions in HTML format.` 
                    }] 
                }]
            })
        });

        const result = await response.json();

        // 4. Send back the answer
        return res.status(200).json(result);

    } catch (error) {
        console.error("Server Crash:", error);
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
