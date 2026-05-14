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
                model: 'claude-sonnet-4-6', // Updated to the official 2026 stable ID
                max_tokens: 2500, // Increased to fit 3 recipes
                messages: [
                    {
                        role: 'user',
                        content: `You are the executive chef for "Eco Chef". 
                        Based on these ingredients: ${ingredients}, provide 3 unique zero-waste recipe options.
                        
                        ${isQuick ? "CRITICAL: 'QuickMode' is ACTIVE. All 3 recipes MUST be prepared and cooked in under 15 minutes." : "Provide a variety of cooking styles."} 
                        
                        Format each recipe clearly in HTML using this structure:
                        <div class="recipe-option">
                          <h3>[Recipe Name]</h3>
                          <p><b>Time:</b> [Estimated Minutes]</p>
                          <b>Ingredients:</b><ul><li>item</li></ul>
                          <b>Instructions:</b><ol><li>step</li></ol>
                        </div>
                        <hr>`
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
