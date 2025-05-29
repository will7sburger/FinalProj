import { GoogleGenerativeAI } from "@google/generative-ai"

export const processImageWithGemini = async (args: {
  type: string
  emotion: string
  multiplier: number
  encodedImage: string
}): Promise<string> => {
  const { type, emotion, multiplier } = args

  const apiKey = "AIzaSyBYfq0r5rk8IGkChHzBQe_CC6-VorSOQV4"
  const genAI = new GoogleGenerativeAI(apiKey)

  let prompt = ""
  if (type === "Scenery") {
    prompt = getEmotionPromptScenery("the image", emotion, multiplier)
  } else {
    throw new Error("Currently only 'Scenery' type is supported.")
  }

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-preview-image-generation",
  })

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "image/png",
    },
  })

  const candidates = result.response.candidates
  const parts = candidates?.[0]?.content?.parts
  const inlineData = parts?.[0]?.inlineData

  if (inlineData?.data && inlineData?.mimeType) {
    return `data:${inlineData.mimeType};base64,${inlineData.data}`
  }

  throw new Error("Image generation failed")
}

// Function for scenery emotion prompts
function getEmotionPromptScenery(imageName: string, emotion: string, multiplier: number): string {
  let prompt = ""

  switch (emotion) {
    case "happy":
      switch (multiplier) {
        case 1:
          prompt = `Transform ${imageName} into a subtly happier scene: increase overall brightness by ~10%, boost color saturation by ~15%, add a warm golden hue (~+5 mireds), maintain medium contrast and crisp clarity, widen field of view slightly (+5°), keep depth of field broad (sharp background), remove any vignette, and preserve realistic lighting and textures.`
          break
        case 2:
          prompt = `Transform ${imageName} into a noticeably happier scene: increase brightness by ~25%, raise saturation by ~35%, apply a stronger warm-golden tint (~+12 mireds), maintain medium-high contrast, widen FOV significantly (+15°), keep background in focus, soften subtle highlights to feel glowing, remove any peripheral darkening, and retain realistic photographic detail.`
          break
        case 3:
          prompt = `Transform ${imageName} into an ultra-exuberant, joy-packed scene: crank brightness up ~50%, boost saturation by ~70%, apply a pronounced golden-hour color temperature (+25 mireds), use medium contrast with bright highlights, maximize FOV (+30°), keep entire scene razor-sharp, introduce a slight dreamy glow on highlights (but no unnatural flares), and ensure it still reads as a plausible sunlit beach photograph.`
          break
        default:
          prompt = "Invalid multiplier. Please choose 1, 2, or 3."
      }
      break

    case "sad":
      switch (multiplier) {
        case 1:
          prompt = `Transform ${imageName} into a subtly sadder scene: lower brightness by ~10%, desaturate colors by ~15% toward blues/greys, apply a slight cool-blue tint (~–5 mireds), reduce contrast slightly (soften shadows/highlights), narrow FOV by ~5° (gentle crop), introduce a very mild vignette, soften focus on background (shallow DOF), and preserve a realistic overcast feel.`
          break
        case 2:
          prompt = `Transform ${imageName} into an appreciably melancholic scene: dim brightness by ~25%, further desaturate by ~35%, strengthen cool-blue overlay (~–12 mireds), lower contrast more (flat lighting), tighten FOV by ~15°, add a gentle but noticeable vignette, soften edges/background blur more, and retain natural-looking cloud cover.`
          break
        case 3:
          prompt = `Transform ${imageName} into an intensely sorrowful, dreamy gloom: drop brightness ~50%, push colors toward desaturated steel-blue (~–25 mireds), minimize contrast (hazy flat look), crop tightly (narrow FOV +30°), apply a soft but visible dark vignette, blur background heavily (shallow DOF), add a whisper of mist or haze for atmosphere, and keep it looking like a realistic, moody photograph.`
          break
        default:
          prompt = "Invalid multiplier. Please choose 1, 2, or 3."
      }
      break

    case "angry":
      switch (multiplier) {
        case 1:
          prompt = `Transform ${imageName} into a slightly intense/angry atmosphere: deepen shadows by ~10%, boost contrast by ~15%, warm color balance by +5 mireds toward reds, slightly tighten FOV (–5°), sharpen details especially on rock edges, remove any blur, add a subtle hard-edged vignette, and preserve naturalistic midday light.`
          break
        case 2:
          prompt = `Transform ${imageName} into a noticeably angrier scene: deepen shadows by ~25%, raise contrast by ~35%, intensify warm-red tint (+12 mireds), crop more tightly (–15° FOV), sharpen every texture/detail, apply a stronger dark vignette, and maintain realistic but dramatic lighting.`
          break
        case 3:
          prompt = `Transform ${imageName} into a fiercely wrathful, dramatic vista: drop shadows by ~50%, max out midtone-highlight contrast, flood-warm the image with red/orange (+25 mireds), use very tight FOV (–30°), hyper-sharpen surface details, apply a pronounced hard-edged vignette, and ensure it still reads as a believable yet intense canyon photograph.`
          break
        default:
          prompt = "Invalid multiplier. Please choose 1, 2, or 3."
      }
      break

    case "afraid":
      switch (multiplier) {
        case 1:
          prompt = `Transform ${imageName} into a subtly eerie/tense scene: lower brightness by ~10%, slightly increase shadow contrast (+15%), desaturate overall colors by ~10% with a mild cool-green tint (–5 mireds), widen FOV by +5° to suggest vigilance, blur background moderately (shallow DOF), apply a gentle vignette, and keep realistic dusk or cloudy lighting.`
          break
        case 2:
          prompt = `Transform ${imageName} into a noticeably fearful scene: dim brightness by ~25%, deepen shadows (+35% contrast in darks), further desaturate (–25%), intensify cool-green overlay (–12 mireds), widen FOV by +15°, blur non-central areas more, add a stronger vignette, and preserve a realistic twilight atmosphere.`
          break
        case 3:
          prompt = `Transform ${imageName} into an intensely unnerving, cinematic horror-style scene: drop brightness by ~50%, max shadow contrast, push colors toward desaturated teal/green (–25 mireds), use wide-angle perspective (+30° FOV), heavily blur background (very shallow DOF), apply a pronounced dark vignette, introduce a subtle mist/haze for atmosphere, and ensure it still looks like a realistic photo taken just before nightfall.`
          break
        default:
          prompt = "Invalid multiplier. Please choose 1, 2, or 3."
      }
      break

    default:
      prompt = "Invalid emotion. Please choose happy, sad, angry, or afraid."
  }

  return prompt
}
