import { GoogleAuth } from 'google-auth-library';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const { type, emotion, multiplier, encodedImage } = await req.json();

    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    const location = 'us-central1';
    const modelId = 'veo-2.0-generate-001';

    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    // 1. Submit the initial request
    const predictUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:predictLongRunning`;

    const predictBody = {
      endpoint: `projects/${projectId}/locations/${location}/publishers/google/models/${modelId}`,
      instances: [
        {
          prompt: getEmotionPromptSceneryVideo('this image', emotion, multiplier),
          image: {
            bytesBase64Encoded: encodedImage,
            mimeType: 'image/jpeg'
          }
        }
      ],
      parameters: {
        aspectRatio: "16:9",
        sampleCount: 1,
        durationSeconds: "5",
        personGeneration: "allow_adult",
      }
    };

    const predictResponse = await fetch(predictUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken.token || accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(predictBody)
    });

    if (!predictResponse.ok) {
      throw new Error(`Predict request failed: ${predictResponse.status}`);
    }

    const predictResult = await predictResponse.json();
    const operationName = predictResult.name;
    if (!operationName) throw new Error('No operation name returned from Vertex AI');

    // 2. Poll for results with 3 retries
    const fetchUrl = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/${modelId}:fetchPredictOperation`;
    
    for (let i = 0; i < 6; i++) {
      console.log(`Polling attempt ${i + 1} of 6`);
      await new Promise(res => setTimeout(res, 10000));
      
      const fetchResponse = await fetch(fetchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token || accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ operationName : operationName })
      });

      const fetchResult = await fetchResponse.json();
      console.log('Polling response:', fetchResult);

      const fs = require('fs');
      fs.writeFileSync('C:/response.txt', JSON.stringify(fetchResult));
      console.log('Response saved to C:/response.txt'); 
      console.log(fetchResult,fetchResult.done, typeof fetchResult.done);

    //   if (fetchResult.done) {
    //     if (fetchResult.response?.videos?.[0]?.video?.bytesBase64Encoded) {
    //       console.log('Video generation complete, decoding video data');
    //       const base64 = fetchResult.response.videos[0].video.bytesBase64Encoded;
    //       const videoBuffer = Buffer.from(base64, 'base64');
    //       console.log('Video buffered, size:', videoBuffer.length);
          
    //       return new NextResponse(videoBuffer, {
    //         status: 200,
    //         headers: {
    //           'Content-Type': 'video/mp4',
    //           'Content-Disposition': 'inline; filename="generated.mp4"',
    //           'Content-Length': videoBuffer.length.toString(),
    //         },
    //       });
    //     } else {
    //       console.log('Video generation completed but no video data received');
    //     }
    //   }
    }

    console.log('Video generation timed out after 6 retries');
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    }, { status: 500 });
  }
}

function getEmotionPromptSceneryVideo(sceneDescription: string, emotion: string, multiplier: number): string {
    let prompt = ""
  
    switch (emotion) {
      case "happy":
        switch (multiplier) {
          case 1:
            prompt = `Create a subtly joyful video of ${sceneDescription}. Use a wide, expansive layout—distant hills appear gentle and welcoming. Camera slowly glides with wide FOV (~+10°), colors slightly brighter and more saturated (+10%). Movement is smooth and continuous. Emphasize openness and harmony in the environment.`
            break
          case 2:
            prompt = `Generate a clearly happy video of ${sceneDescription}. Terrain feels flowing and accessible. Use panoramic wide-angle shots (+20° FOV), enhance vibrancy and warmth in color (+25% saturation, +12 mireds). Slow dolly or crane movement to capture openness. Emphasize bright skies and positive spatial coherence.`
            break
          case 3:
            prompt = `Produce an extremely exuberant video of ${sceneDescription}. Scenery feels boundless—wide hills roll gently. Maximize FOV (+30°), apply golden-hour color grading (+50% brightness, +30 mireds), saturated hues, gentle lens flare. Fast drone shots, joyful bird-like motion arcs. Terrain flows freely.`
            break
          default:
            prompt = "Invalid multiplier. Choose 1, 2, or 3."
        }
        break
  
      case "sad":
        switch (multiplier) {
          case 1:
            prompt = `Create a slightly melancholic video of ${sceneDescription}. Hills appear more vertical, effortful. Use narrow FOV (–5°), slightly lower brightness (–10%) and desaturated color palette (–15%). Camera movement is minimal or fixed, emphasizing details and stillness. Focus is pulled toward isolated small elements (e.g., lone flower, rock).`
            break
          case 2:
            prompt = `Generate a clearly sorrowful video of ${sceneDescription}. Terrain seems steep and heavy. FOV is tight (–15°), contrast reduced. Dull bluish tint (–12 mireds), slow camera push-ins with shallow depth of field to isolate details. Time feels slow, weighty. Mist or haze may add distance.`
            break
          case 3:
            prompt = `Produce a deeply sorrowful video of ${sceneDescription}. Environment feels constrained and burdensome—hills rise steeply, paths seem endless. Very narrow FOV (–30°), dim lighting (–40%), low contrast, strong cool desaturation (–25 mireds). Focus tightens obsessively on textures (e.g., cracks, rain streaks). Motion is barely perceptible.`
            break
          default:
            prompt = "Invalid multiplier. Choose 1, 2, or 3."
        }
        break
  
      case "angry":
        switch (multiplier) {
          case 1:
            prompt = `Create a subtly tense video of ${sceneDescription}. Jagged edges in terrain appear sharper. Slightly cropped FOV (–5°), contrast increased (+10%), reddish tint added (+5 mireds). Camera moves with sharper pans or sudden stops. Rocks, faces, and edges feel hostile or intrusive.`
            break
          case 2:
            prompt = `Generate a clearly aggressive video of ${sceneDescription}. Terrain is harsh, angular. FOV is tightly framed (–15°), strong shadows, high contrast (+25%). Movement is abrupt or handheld. Warm color bias (red/orange +12 mireds), fast cuts, hostile interpretation of neutral features (e.g., boulders or trees feel menacing).`
            break
          case 3:
            prompt = `Produce a furious, hostile video of ${sceneDescription}. Landscape looks violent—sharp cliffs, threatening shapes. Very tight FOV (–30°), contrast maximized, saturated red-orange tint (+25 mireds). Extreme fast pans, intense camera shakes. Every neutral element appears threatening. Sound may include low rumbles or sharp mechanical cues.`
            break
          default:
            prompt = "Invalid multiplier. Choose 1, 2, or 3."
        }
        break
  
      case "afraid":
        switch (multiplier) {
          case 1:
            prompt = `Create a slightly anxious video of ${sceneDescription}. Natural threats (steep drop-offs, dark trees) subtly emphasized. FOV fluctuates slightly (+5°), colors desaturated with green/blue bias (–5 mireds). Camera lingers nervously on shadows. Motion is jerky or halted unexpectedly. Peripheral elements draw attention.`
            break
          case 2:
            prompt = `Generate a fearful video of ${sceneDescription}. Dangers in the landscape feel exaggerated—boulders loom, shadows deepen. FOV alternates from wide to tight (+15° swings), cool green desaturation (–12 mireds), background blur increases. Camera mimics searching eyes, detecting threats at edges. Pacing builds tension.`
            break
          case 3:
            prompt = `Produce an intensely frightened video of ${sceneDescription}. Landscape is menacing—trees twist, cliffs leer. FOV swings erratically (wide → zoomed), colors pushed to teal/green desaturation (–25 mireds). Extreme shallow depth of field, mist/fog obscures clarity. Fast motion on periphery triggers perceived threat. Rapid breathing or heartbeat sounds may enhance immersion.`
            break
          default:
            prompt = "Invalid multiplier. Choose 1, 2, or 3."
        }
        break
  
      default:
        prompt = "Invalid emotion. Choose happy, sad, angry, or afraid."
    }
  
    return prompt
  }
  