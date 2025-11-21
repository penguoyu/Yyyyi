import { GoogleGenAI, Type } from "@google/genai";
import { DesignRequest, ViewMode } from '../types';

// Initialize the client
// Using process.env.API_KEY exclusively as per coding guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Refines the user's simple description (potentially in Chinese) into a detailed 
 * English AI image generation prompt optimized for tattoo design.
 */
export const refinePrompt = async (request: DesignRequest): Promise<string> => {
  
  const isPreview = request.viewMode === ViewMode.PREVIEW;

  const prompt = `
    You are an expert tattoo artist and prompt engineer.
    
    The user has provided a tattoo concept in Traditional Chinese. 
    Your task is to:
    1. Understand the Chinese concept, style, and nuances.
    2. TRANSLATE everything into English.
    3. Convert it into a highly detailed image generation prompt for the Gemini Image model.
    
    User Request (Description): "${request.prompt}"
    Style: ${request.style}
    Placement Context: ${request.bodyPart}
    Color Mode: ${request.color}
    Complexity: ${request.complexity}
    View Mode: ${isPreview ? 'PHOTOREALISTIC ON SKIN' : 'FLAT FLASH SHEET DESIGN'}

    CRITICAL INSTRUCTIONS FOR ${isPreview ? 'BODY PREVIEW' : 'FLASH SHEET'}:
    
    ${isPreview ? `
    - The image MUST look like a professional photograph of a tattoo ON HUMAN SKIN.
    - The tattoo should be placed on the "${request.bodyPart}".
    - Include skin texture, pores, and natural lighting.
    - Cinematic lighting, shallow depth of field, 8k resolution, photorealistic.
    ` : `
    - The output MUST be a "Tattoo Flash Sheet" design.
    - WHITE BACKGROUND ONLY.
    - DO NOT generate human skin, body parts, arms, or legs. Just the ink design on white paper.
    - It should look like a 2D illustration or drawing, ready to be transferred.
    - Keywords: "white background", "clean white paper", "tattoo design", "vector style", "isolated".
    `}
    
    Rules for the Output Prompt:
    1. OUTPUT ONLY THE RAW ENGLISH PROMPT.
    2. Focus on: "${request.style}" artistic techniques.
    3. Negative keywords (implied): ${isPreview ? '"cartoonish", "fake"' : '"skin", "body", "blurred", "messy"'}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
        systemInstruction: "You are an expert prompt engineer. Your output must be in English.",
      }
    });

    return response.text || request.prompt;
  } catch (error) {
    console.error("Error refining prompt:", error);
    // Fallback
    const base = `Tattoo design of ${request.prompt}, style ${request.style}, ${request.color}`;
    if (isPreview) {
      return `${base}, tattooed on ${request.bodyPart}, photorealistic, 8k, skin texture`;
    } else {
      return `${base}, white background, high quality, 2d flat design`;
    }
  }
};

/**
 * Helper function to extract image data from response
 */
const extractImageFromResponse = (response: any): string => {
  if (response.candidates) {
    for (const candidate of response.candidates) {
      for (const part of candidate.content.parts) {
        if (part.inlineData && part.inlineData.data) {
          const mimeType = part.inlineData.mimeType || 'image/png';
          return `data:${mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
  }
  throw new Error("No image data found in response");
}

/**
 * Generates the actual tattoo image using Gemini 3.0 Pro Image (Nano Banana Pro)
 * with a fallback to Gemini 2.5 Flash Image (Nano Banana).
 */
export const generateTattooImage = async (refinedPrompt: string): Promise<string> => {
  // 1. Try the High Quality Model (Gemini 3.0 Pro Image)
  try {
    console.log("Attempting generation with Gemini 3.0 Pro Image...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: refinedPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: '1:1',
          imageSize: '2K', // High quality only available on Pro
        }
      }
    });
    return extractImageFromResponse(response);
  } catch (error: any) {
    console.warn("Gemini 3 Pro failed (likely permission/quota), falling back to Flash Image.", error);
    
    // 2. Fallback to Standard Model (Gemini 2.5 Flash Image)
    // Note: Flash Image allows 'aspectRatio' but NOT 'imageSize'
    try {
      console.log("Attempting generation with Gemini 2.5 Flash Image...");
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [{ text: refinedPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1' 
            // imageSize is NOT supported on Flash Image, do not include it
          }
        }
      });
      return extractImageFromResponse(response);
    } catch (fallbackError) {
      console.error("Fallback generation also failed:", fallbackError);
      throw fallbackError; // Throw the error to be handled by the UI
    }
  }
};