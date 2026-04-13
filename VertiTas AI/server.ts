import dotenv from "dotenv";
dotenv.config({ override: true });

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import * as cheerio from "cheerio";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Analyze text or URL
  app.post("/api/analyze", async (req, res) => {
    try {
      const { input, isUrl } = req.body;
      let textToAnalyze = input;

      if (isUrl) {
        // Scrape the URL
        const response = await fetch(input);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        // Remove scripts and styles
        $('script, style, nav, footer, header').remove();
        textToAnalyze = $('body').text().replace(/\\s+/g, ' ').trim();
        
        if (textToAnalyze.length > 50000) {
          textToAnalyze = textToAnalyze.substring(0, 50000); // Limit length
        }
      }

      // Use Gemini to analyze the text
      const prompt = `Analyze the following news text and determine if it is REAL or FAKE. 
Provide a confidence score (0-100), an explanation, a concise summary of the article, a list of suspicious or misleading words, 
and an estimated source credibility (Trusted, Suspicious, or Unknown). 
Also, provide a concise 'searchQuery' that captures the main claim of the text, which will be used to query a fact-checking API.

Text to analyze:
"""
${textToAnalyze}
"""`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING, enum: ["REAL", "FAKE"] },
              confidence: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              summary: { type: Type.STRING },
              suspiciousWords: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              sourceCredibility: { type: Type.STRING, enum: ["Trusted", "Suspicious", "Unknown"] },
              sourceScore: { type: Type.NUMBER },
              searchQuery: { type: Type.STRING }
            },
            required: ["label", "confidence", "explanation", "summary", "suspiciousWords", "sourceCredibility", "sourceScore", "searchQuery"]
          }
        }
      });

      const result = JSON.parse(response.text || "{}");
      let factChecks = [];

      const factCheckApiKey = process.env.GOOGLE_API_KEY;

      if (result.searchQuery && factCheckApiKey) {
        try {
          const fcUrl = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(result.searchQuery)}&key=${factCheckApiKey}`;
          const fcResponse = await fetch(fcUrl);
          const fcData = await fcResponse.json();
          if (fcData.claims && fcData.claims.length > 0) {
            factChecks = fcData.claims.slice(0, 5).map((claim: any) => {
              const review = claim.claimReviews && claim.claimReviews[0];
              return {
                claim: claim.text,
                publisher: review ? review.publisher.name : "Unknown",
                verdict: review ? review.textualRating : "Unknown",
                url: review ? review.url : ""
              };
            });
          }
        } catch (error) {
          console.error("Fact Check API error:", error);
        }
      }

      result.factChecks = factChecks;
      result.factCheckApiEnabled = !!factCheckApiKey;
      res.json({ success: true, result, scrapedText: isUrl ? textToAnalyze : undefined });
    } catch (error: any) {
      let errorMessage = error.message || "An unexpected error occurred during analysis.";
      
      // Check if the error is related to an invalid Gemini API key
      if (errorMessage.includes("API key not valid") || errorMessage.includes("API_KEY_INVALID")) {
        errorMessage = "The Gemini API key is invalid. Please ensure you have set a valid Gemini API key in your AI Studio secrets or .env file. Note: The Gemini API key is different from the Google Fact Check API key.";
        console.error("Configuration Error:", errorMessage);
      } else {
        console.error("Analysis error:", error);
      }
      
      res.status(500).json({ success: false, error: errorMessage });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
