const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure node-fetch@2 is installed for CommonJS
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/chat-widget.html'));
});

const GPT_API_KEY = process.env.OPENAI_API_KEY;
const GPT_MODEL = 'gpt-4o-mini';

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const siteContext = req.body.site || "Unknown Sector";

    let systemPrompt = "You are Txchya, a cyberpunk AI assistant.";
    try {
        systemPrompt = fs.readFileSync(path.join(__dirname, '../prompts/txchya-system-prompt.txt'), 'utf-8');
    } catch (err) {
        console.error("Could not read system prompt file:", err);
    }

    // Add dynamic site information to the prompt
    const enhancedSystemPrompt = `${systemPrompt}\n\n[CONTEXT: You are currently active on: ${siteContext}. Adjust your references accordingly.]`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GPT_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: GPT_MODEL,
                messages: [
                    { role: "system", content: enhancedSystemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 500
            })
        });

        const data = await response.json();
        console.log("OpenAI Response Data:", JSON.stringify(data, null, 2));

        if (data.error) {
            console.error("OpenAI API Error:", data.error);
            return res.status(500).json({ error: data.error.message });
        }

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error("Unexpected OpenAI Response Structure:", data);
            return res.status(500).json({ error: "Unexpected response from AI" });
        }

        const reply = data.choices[0].message.content;
        console.log("Txchya Reply:", reply);
        res.json({ reply });
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: 'Error contacting GPT API' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Txchya backend running on port ${PORT}`));
