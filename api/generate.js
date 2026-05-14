export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const data = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const { ingredients, isQuick } = data;
        
        const CLAUDE_KEY = process.env.CLAUDE_API_KEY;

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
                        content: `You are the executive chef for "Eco Chef". The user has: ${ingredients}. Provide 3 unique zero-waste recipe options. ${isQuick ? "All 3 MUST be under 15 minutes." : ""} Format each in a <div class="recipe-option"> with <h3>, <ul>, and <ol> tags.`
                    }
                ]
            })
        });

        const result = await response.json();
        return res.status(200).json({ text: result.content[0].text });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
