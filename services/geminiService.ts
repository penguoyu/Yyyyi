
import { GoogleGenAI } from "@google/genai";
import { DesignRequest, ViewMode } from '../types';

/**
 * Refines the user's simple prompt into a detailed artistic prompt.
 */
export const refinePrompt = async (request: DesignRequest): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-flash-preview';
  
  const systemInstruction = `You are a world-class tattoo artist. Convert the user's idea into a professional image generation prompt.
  - If a reference image is provided, focus on modifying or enhancing it according to the concept.
  - If no image is provided, create a design from scratch.
  - Ensure the output is only the prompt text in English.`;

  let userContent = `Concept: ${request.prompt}, Style: ${request.style}, BodyPart: ${request.bodyPart}, Complexity: ${request.complexity}, Color: ${request.color}`;
  
  if (request.referenceImage) {
    userContent += `\nReference Note: Based on the uploaded reference image, adapt the design to fit the user's request while maintaining structural coherence.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: userContent,
      config: { systemInstruction }
    });
    return response.text || request.prompt;
  } catch (error) {
    console.error("Prompt refinement failed:", error);
    return request.prompt;
  }
};

/**
 * Generates the tattoo image using Gemini 3 Pro Image (Image-to-Image support).
 */
export const generateTattooImage = async (refinedPrompt: string, referenceImage?: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelId = 'gemini-3-pro-image-preview';

  const parts: any[] = [{ text: refinedPrompt }];
  
  if (referenceImage) {
    // Extract base64 data and mime type
    const matches = referenceImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      parts.unshift({
        inlineData: {
          mimeType: matches[1],
          data: matches[2]
        }
      });
    }
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: { parts },
      config: {
        imageConfig: {
            aspectRatio: "1:1",
            imageSize: "1K"
        }
      }
    });

    if (response.candidates && response.candidates.length > 0) {
      const parts = response.candidates[0].content.parts;
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image found");
  } catch (error: any) {
    if (error.message?.includes("not found")) throw new Error("KeyResetRequired");
    throw error;
  }
};
