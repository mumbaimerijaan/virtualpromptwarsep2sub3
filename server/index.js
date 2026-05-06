import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import NodeCache from 'node-cache';
import { GoogleGenAI } from '@google/genai';

// ES Module path support
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env only in development
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '../.env') });
}

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Initialize AI Response Cache (1 hour TTL)
const aiCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

// Serve static files from the Vite build directory
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Lazy client variable
let ai = null;

/**
 * AI Chat Endpoint
 */
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, history, currentLanguage } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Cache-Aside Pattern
    const cacheKey = JSON.stringify({ prompt, history, currentLanguage });
    const cachedResponse = aiCache.get(cacheKey);
    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const langNames = { en: 'English', hi: 'Hindi', mr: 'Marathi' };
    const currentLangName = langNames[currentLanguage || 'en'] || 'English';

    // Initialize Gemini
    if (!ai) {
      ai = new GoogleGenAI({ apiKey: process.env.VITE_GEMINI_API_KEY });
    }

    // Convert history to Gemini format
    const contents = history && history.length > 0
      ? history.map(m => ({ role: m.type === 'user' ? 'user' : 'model', parts: [{ text: m.content }] }))
      : [];

    contents.push({ role: 'user', parts: [{ text: prompt }] });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: `You are the smart assistant for the 'Matdaan Saathi' application. 
        
        Your instructions:
        1. If the user asks a factual question about Indian elections that you know is TRUE, return a short ONE-LINE answer in the 'message' field and set intent to 'FACT_REPLY'.
        2. For any other queries, set intent to 'UNKNOWN' and respond EXACTLY with: 'I can help with voter services and election guidance.'
        3. MANDATORY: You MUST respond in ${currentLangName}.
        4. Keep election acronyms (EPIC, SIR, BLO, ECI, EVM, VVPAT) unchanged.
        
        You MUST respond with valid JSON containing:
        - intent: FACT_REPLY or UNKNOWN
        - message: The response in ${currentLangName}
        - suggestions: Array of 2-3 related topics in ${currentLangName}`,
        responseMimeType: "application/json",
      }
    });

    const resultObj = JSON.parse(response.text());
    
    // Cache and return
    aiCache.set(cacheKey, resultObj);
    res.json(resultObj);

  } catch (error) {
    console.error('AI Processing Error:', error);
    res.status(500).json({
      intent: 'ERROR',
      message: 'I am having trouble connecting right now. Please try again later.',
      suggestions: ['Register as a voter', 'Check voter list', 'How to vote']
    });
  }
});

// SPA support: Catch-all route
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    next();
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Lite Server running on port ${port}`);
});
