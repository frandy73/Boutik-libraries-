import { GoogleGenAI, Type } from "@google/genai";
import { Product, AiResponse } from '../types';

// Ensure API Key is available
const API_KEY = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define the response schema for structured JSON output
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ['ADD_TO_CART', 'SEARCH', 'GREETING', 'SPECIAL_REQUEST', 'UNKNOWN'],
      description: "The user's intention based on the text."
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          productCode: {
            type: Type.STRING,
            description: "The EXACT code of the book found in the context list. IF intent is SPECIAL_REQUEST, put the Title/Author of the missing book here."
          },
          quantity: {
            type: Type.INTEGER,
            description: "Quantity requested. Default to 1 if not specified."
          }
        }
      }
    },
    message: {
      type: Type.STRING,
      description: "A short, polite response to the user in French. If SPECIAL_REQUEST, confirm the special order request AND suggest 1-2 similar books from the available catalog."
    }
  },
  required: ['intent', 'items', 'message']
};

export const parseUserMessage = async (
  message: string, 
  availableProducts: Product[]
): Promise<AiResponse> => {
  
  // Context optimized for books: Title, Author, Category, and Summary
  const productContext = availableProducts.map(p => 
    `[${p.code}] ${p.description} (${p.category}) - Résumé: ${p.summary || "N/A"}`
  ).join('\n');

  const systemInstruction = `
    You are BOUTIK PAW, a knowledgeable and friendly virtual bookseller (Libraire).
    
    Your goal is to help users find EBOOKS and books in your catalog and prepare their orders.
    
    Here is the available BOOK CATALOG (Format: [CODE] TITLE - AUTHOR (GENRE) - SUMMARY):
    ---
    ${productContext}
    ---

    RULES:
    1. If the user asks for a book by title or author, try to match it to the catalog.
    2. Be flexible with spelling (e.g., "kiyosaki" matches "Robert Kiyosaki").
    3. If the book is FOUND in the catalog:
       - Set intent to 'ADD_TO_CART'.
       - Return the corresponding CODE.
       - Include a brief 1-sentence summary of the book in your message.

    4. If the user explicitly asks for a book that is NOT in the catalog:
       - Set intent to 'SPECIAL_REQUEST'.
       - Set 'productCode' to the Title and Author of the requested book.
       - In your 'message':
         a) Confirm you have added a "Special Request" (Commande Spéciale) to their cart for this specific book.
         b) Look at the user's requested genre/topic and suggest 1 or 2 similar books that ARE in the catalog.

    5. If the user asks for recommendations (e.g., "books about business", "roman haitien"), set intent to 'SEARCH' and mention the category in your message.
    6. Always reply in French. Be enthusiastic about reading.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response from AI");

    const parsedData = JSON.parse(jsonText) as AiResponse;
    return parsedData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Return a fallback state so the app can switch to local fuzzy search
    return {
      intent: 'UNKNOWN',
      items: [],
      message: '' 
    };
  }
};