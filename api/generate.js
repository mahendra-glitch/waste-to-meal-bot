export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isQuick } = data;
        
        const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

        if (!CLAUDE_KEY) {
            return res.status(500).json({ error: "API Key missing in Vercel" });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': CLAUDE_KEY,
                'anthropic-version': '2023-06-01', 
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-6', 
                max_tokens: 2500, 
                messages: [
                    {
                        role: 'user',
                        content: `You are the executive chef for "Eco Chef". The user has: ${ingredients}. 
                        Provide exactly 3 unique zero-waste recipe options. 
                        ${isQuick ? "CRITICAL: All 3 MUST be under 15 minutes." : ""} 
                        
                        STRICT FORMATTING RULES:
                        1. Start your response immediately with <div class="recipe-option">.
                        2. Do NOT include intro text, conversational filler, or markdown code blocks (\`\`\`html).
                        3. Wrap each recipe in exactly one <div class="recipe-option"> tag.
                        4. Structure inside: <h3>Title</h3>, <p><b>Time:</b> Minutes</p>, <b>Ingredients:</b><ul>, <b>Steps:</b><ol>.`
                    }
                ]
            })
        });

        const result = await response.json();

        if (result.error) {
            return res.status(400).json({ error: result.error.message });
        }

        return res.status(200).json({ text: result.content[0].text });

    } catch (error) {
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
