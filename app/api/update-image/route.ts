import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { emotion, image, fileName, hallucinationEnabled } = await request.json();

    var GEMINI_API_KEY = "AIzaSyBYfq0r5rk8IGkChHzBQe_CC6-VorSOQV4"

    // Check if API key exists
    if (GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY not found in environment variables");
      return NextResponse.json({ 
        error: "API key not configured. Please add GEMINI_API_KEY to your .env.local file." 
      }, { status: 500 });
    }

    console.log("API Key found, initializing Gemini...");

    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

    // Skip the base64 prefix to get just the image data
    const imageData = image.split(",")[1];

    // Create emotion-based prompt
    const intensity = hallucinationEnabled ? "extreme and exaggerated" : "subtle and realistic";
    
    // Map emotion values to descriptions
    const getEmotionDescription = (emotion: number, hallucination: boolean) => {
      if (hallucination) {
        if (emotion <= -8) return "apocalyptic despair and cosmic horror";
        if (emotion <= -6) return "extreme terror and overwhelming fear";
        if (emotion <= -4) return "devastating sorrow and deep anguish";
        if (emotion <= -2) return "sadness and disappointment";
        if (emotion < 0) return "slight sadness or melancholy";
        if (emotion === 0) return "neutral and calm expression";
        if (emotion <= 2) return "happiness and contentment";
        if (emotion <= 4) return "euphoric joy and elation";
        if (emotion <= 6) return "transcendent bliss and wonder";
        if (emotion <= 8) return "cosmic ecstasy and divine joy";
        return "divine rapture and ultimate bliss";
      } else {
        if (emotion <= -2) return "sadness and disappointment";
        if (emotion < 0) return "slight sadness or melancholy";
        if (emotion === 0) return "neutral and calm expression";
        if (emotion <= 1) return "happiness and contentment";
        return "joy and excitement";
      }
    };

    const emotionDesc = getEmotionDescription(emotion, hallucinationEnabled);
    const effect = emotionDesc.split(" ")[0];
    const mode = hallucinationEnabled ? "hallucination" : "realistic";

    const prompt = `Describe how this portrait image would look if the person showed ${emotionDesc}. 
    Apply ${intensity} emotional transformation while maintaining the person's identity and basic facial structure. 
    Focus on facial expression, eye emotion, mouth position, and overall emotional aura. 
    ${hallucinationEnabled ? "Include dramatic lighting, color shifts, or surreal elements that enhance the emotion." : "Keep the transformation natural and believable."}
    Be detailed but concise.`;

    console.log(prompt);

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Prepare image data for Gemini
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType: image.startsWith("data:image/png") ? "image/png" : "image/jpeg",
      },
    };

    console.log("Sending request to Gemini...");

    // Generate content with image and prompt
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const description = response.text();

    console.log("Gemini response received successfully");

    return NextResponse.json({
      processedImage: image, // Return original image for now
      description: description,
      emotion,
      effect,
      hallucinationEnabled,
      mode,
      originalFileName: fileName,
      message: `Applied ${effect} emotion effect in ${mode} mode`,
      geminiMetadata: {
        model: "gemini-pro-vision",
        promptUsed: prompt,
      },
    });
  } catch (error: any) {
    console.error("Detailed error:", error);
    
    // More specific error messages
    if (error.message?.includes("API_KEY_INVALID")) {
      return NextResponse.json({ 
        error: "Invalid API key. Please check your Gemini API key." 
      }, { status: 401 });
    }
    
    if (error.message?.includes("PERMISSION_DENIED")) {
      return NextResponse.json({ 
        error: "Permission denied. Please check your API key permissions." 
      }, { status: 403 });
    }

    if (error.message?.includes("QUOTA_EXCEEDED")) {
      return NextResponse.json({ 
        error: "API quota exceeded. Please check your usage limits." 
      }, { status: 429 });
    }

    return NextResponse.json({ 
      error: "Failed to process image", 
      details: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}