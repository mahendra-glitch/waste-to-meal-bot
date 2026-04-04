export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isLazy } = data;
        
        // IMPORTANT: Make sure your Vercel Environment Variable is named CLAUDE_API_KEY
        const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

        if (!CLAUDE_KEY) {
            return res.status(500).json({ error: "Claude API Key missing in Vercel Settings" });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': CLAUDE_KEY,
                'anthropic-version': '2023-06-01', 
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                messages: [
                    {
                        role: 'user',
                        content: `You are a professional zero-waste chef. 
                        Create a recipe using only these ingredients: ${ingredients}. 
                        ${isLazy ? "The recipe MUST be 'Lazy Mode': under 15 minutes." : ""} 
                        Return the response in clean HTML: <h3>Recipe Title</h3><br><b>Ingredients:</b><ul><li>item</li></ul><b>Steps:</b><ol><li>step</li></ol>`
                    }
                ]
            })
        });

        const result = await response.json();

        if (result.error) {
            return res.status(400).json({ error: result.error.message });
        }

        // Send only the text content back to the frontend
        return res.status(200).json({ text: result.content[0].text });

    } catch (error) {
        return res.status(500).json({ error: "Server Error", message: error.message });
    }
}
