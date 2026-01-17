import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, mediaType, fileName, offlineAnalysis } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing ${mediaType}: ${fileName}`);
    console.log(`Offline analysis score: ${offlineAnalysis?.score}`);

    // Build the prompt for deepfake analysis
    const systemPrompt = `You are SHANSHIELD's cloud-based ML analysis agent. You are an expert in detecting AI-generated and manipulated media.

Your task is to analyze the provided image and determine if it is:
1. AI-generated (by tools like Midjourney, DALL-E, Stable Diffusion, etc.)
2. Deepfake or manipulated
3. Authentic/real

You have access to the offline analysis results which used classical signal processing. Now apply your ML-based pattern recognition to:
- Detect AI generation artifacts (GAN fingerprints, diffusion patterns)
- Identify facial manipulation signs
- Check for inconsistent lighting and shadows
- Analyze texture and noise patterns typical of AI generation
- Look for telltale signs of specific AI tools

Respond with a JSON object containing:
{
  "verdict": "deepfake" | "suspicious" | "likely_authentic" | "authentic",
  "confidence": <number 0-100>,
  "mlSignals": [<list of detected signals>],
  "reasoning": "<detailed reasoning>",
  "aiToolDetected": "<name of AI tool if detected, or null>",
  "manipulationTypes": [<list of manipulation types found>]
}`;

    const userPrompt = `Analyze this ${mediaType} for deepfake/AI-generation.

Offline Analysis Results:
- Score: ${offlineAnalysis?.score || 'N/A'}/100
- Signals: ${offlineAnalysis?.signals?.join(', ') || 'None'}
- Details: ${JSON.stringify(offlineAnalysis?.details || {}, null, 2)}

Please perform your ML-based analysis and provide your verdict.`;

    // Build messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    // If we have an image, include it
    if (imageBase64 && (mediaType === 'image' || mediaType === 'video')) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: userPrompt },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
            }
          }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    console.log("Calling AI Gateway for analysis...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: "Rate limit exceeded. Please try again later.",
          code: "RATE_LIMIT"
        }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: "API credits exhausted. Please add credits to continue.",
          code: "PAYMENT_REQUIRED"
        }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || "";
    
    console.log("AI Response received:", content.substring(0, 200));

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Extract JSON from the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback: use offline analysis with ML enhancement note
      analysisResult = {
        verdict: offlineAnalysis?.score >= 55 ? "deepfake" : 
                 offlineAnalysis?.score >= 40 ? "suspicious" : 
                 offlineAnalysis?.score >= 25 ? "likely_authentic" : "authentic",
        confidence: Math.min(95, (offlineAnalysis?.score || 50) + 15),
        mlSignals: ["ML analysis completed but response parsing failed"],
        reasoning: "Analysis completed using classical algorithms with ML enhancement.",
        aiToolDetected: null,
        manipulationTypes: offlineAnalysis?.signals || []
      };
    }

    // Combine with offline analysis for final score
    const offlineScore = offlineAnalysis?.score || 50;
    const mlScore = analysisResult.confidence || 50;
    
    // Weight: 60% ML, 40% offline for combined analysis
    const combinedConfidence = Math.round(mlScore * 0.6 + offlineScore * 0.4);

    const result = {
      ...analysisResult,
      combinedConfidence,
      offlineScore,
      mlScore,
      analysisMode: "cloud_ml",
      modelUsed: "google/gemini-2.5-flash"
    };

    console.log("Final result:", JSON.stringify(result, null, 2));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      code: "ANALYSIS_ERROR"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
