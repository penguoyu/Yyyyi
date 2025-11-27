import { GoogleGenAI } from "@google/genai";
import { DesignRequest, ViewMode } from '../types';

// Declare process to satisfy TypeScript since we are using define in vite.config.ts
declare const process: {
  env: {
    API_KEY: string;
  }
};

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Refines the user's simple description into a detailed English prompt.
 */
export const refinePrompt = async (request: DesignRequest): Promise<string> => {
  
  const isPreview = request.viewMode === ViewMode.PREVIEW;

  const prompt = `
    You are an expert tattoo artist.
    Task: Translate user request to English and create a detailed image generation prompt.
    
    User Request: "${request.prompt}"
    Style: ${request.style}
    Body Part: ${request.bodyPart}
    Color: ${request.color}
    Mode: ${isPreview ? 'PHOTOREALISTIC TATTOO ON SKIN' : 'FLASH SHEET DESIGN ON PAPER'}

    Requirements:
    ${isPreview ? `
    - Photorealistic, 8k resolution, cinematic lighting.
    - Close-up of tattoo on human skin (${request.bodyPart}).
    - Show skin texture.
    ` : `
    - White background, clean lines.
    - Vector style illustration.
    - NO skin, NO body parts. Isolated design.
    `}
    
    OUTPUT: ONLY the English prompt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || request.prompt;
  } catch (error) {
    console.error("Prompt refinement failed, using raw input:", error);
    return `${request.style} tattoo of ${request.prompt}, ${request.color}`;
  }
};

const extractImageFromResponse = (response: any): string => {
  if (response.candidates) {
    for (const candidate of response.candidates) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
  }
  throw new Error("No image data found in response");
}

/**
 * Generates the tattoo image.
 * Resilient logic: Tries Pro first, catches 403/Permission errors explicitly to trigger fallback.
 */
export const generateTattooImage = async (refinedPrompt: string): Promise<string> => {
  
  // 1. Attempt High Quality (Gemini 3 Pro)
  try {
    console.log("Attempting generation with Gemini 3.0 Pro Image...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: refinedPrompt }] },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K', 
        }
      }
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.warn("Gemini 3 Pro failed. This is common for free keys. Error:", error);
    
    // 2. Fallback to Standard (Gemini 2.5 Flash Image)
    // This model is much more likely to work with standard API keys.
    try {
      console.log("Fallback: Attempting generation with Gemini 2.5 Flash Image...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: { parts: [{ text: refinedPrompt }] },
        config: {
          imageConfig: {
            aspectRatio: '1:1' 
            // Note: imageSize is NOT supported on Flash Image
          }
        }
      });
      return extractImageFromResponse(response);
    } catch (fallbackError) {
      console.error("All image generation attempts failed.", fallbackError);
      throw fallbackError; 
    }
  }
};