"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Upload, RotateCcw, Loader2, Zap, Info, MessageSquare } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

export default function Home() {
  const [emotionValue, setEmotionValue] = useState<number>(0)
  const [hallucinationEnabled, setHallucinationEnabled] = useState<boolean>(false)
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [description, setDescription] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [fileName, setFileName] = useState<string>("")
  var [apiKey, setApiKey] = useState<string>("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Basic emotion labels for -2 to 2
  const basicEmotionLabels = {
    "-2": { emoji: "😡", text: "Very Sad/Angry" },
    "-1": { emoji: "😔", text: "Slightly Sad" },
    "0": { emoji: "😐", text: "Neutral" },
    "1": { emoji: "🙂", text: "Happy" },
    "2": { emoji: "😄", text: "Very Happy/Excited" },
  }

  // Extended emotion labels for -10 to 10 (hallucination mode)
  const extendedEmotionLabels = {
    "-10": { emoji: "💀", text: "Apocalyptic Despair" },
    "-8": { emoji: "😱", text: "Extreme Terror" },
    "-6": { emoji: "😭", text: "Devastating Sorrow" },
    "-4": { emoji: "😠", text: "Intense Anger" },
    "-2": { emoji: "😡", text: "Very Sad/Angry" },
    "-1": { emoji: "😔", text: "Slightly Sad" },
    "0": { emoji: "😐", text: "Neutral" },
    "1": { emoji: "🙂", text: "Happy" },
    "2": { emoji: "😄", text: "Very Happy/Excited" },
    "4": { emoji: "🤩", text: "Euphoric Joy" },
    "6": { emoji: "🚀", text: "Transcendent Bliss" },
    "8": { emoji: "✨", text: "Cosmic Ecstasy" },
    "10": { emoji: "🌟", text: "Divine Rapture" },
  }

  const currentLabels = hallucinationEnabled ? extendedEmotionLabels : basicEmotionLabels
  const sliderMin = hallucinationEnabled ? -10 : -2
  const sliderMax = hallucinationEnabled ? 10 : 2
  const sliderStep = hallucinationEnabled ? 2 : 1

  const getCurrentEmotionLabel = () => {
    const key = emotionValue.toString()
    return currentLabels[key as keyof typeof currentLabels] || { emoji: "❓", text: "Unknown" }
  }

  apiKey = "AIzaSyBYfq0r5rk8IGkChHzBQe_CC6-VorSOQV4";
  
  // Gemini API function
  const processImageWithGemini = async (emotion: number, image: string, hallucination: boolean) => {
    try {
      if (!apiKey) {
        throw new Error("Please enter your Gemini API key first")
      }

      console.log("Initializing Gemini with API key...")

      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(apiKey)

      // Skip the base64 prefix to get just the image data
      const imageData = image.split(",")[1]

      // Create emotion-based prompt
      const intensity = hallucination ? "extreme and exaggerated" : "subtle and realistic"

      // Map emotion values to descriptions
      const getEmotionDescription = (emotion: number, hallucination: boolean) => {
        if (hallucination) {
          if (emotion <= -8) return "apocalyptic despair and cosmic horror"
          if (emotion <= -6) return "extreme terror and overwhelming fear"
          if (emotion <= -4) return "devastating sorrow and deep anguish"
          if (emotion <= -2) return "sadness and disappointment"
          if (emotion < 0) return "slight sadness or melancholy"
          if (emotion === 0) return "neutral and calm expression"
          if (emotion <= 2) return "happiness and contentment"
          if (emotion <= 4) return "euphoric joy and elation"
          if (emotion <= 6) return "transcendent bliss and wonder"
          if (emotion <= 8) return "cosmic ecstasy and divine joy"
          return "divine rapture and ultimate bliss"
        } else {
          if (emotion <= -2) return "sadness and disappointment"
          if (emotion < 0) return "slight sadness or melancholy"
          if (emotion === 0) return "neutral and calm expression"
          if (emotion <= 1) return "happiness and contentment"
          return "joy and excitement"
        }
      }

      const emotionDesc = getEmotionDescription(emotion, hallucination)

      const prompt = `Describe how this portrait image would look if the person showed ${emotionDesc}. 
      Apply ${intensity} emotional transformation while maintaining the person's identity and basic facial structure. 
      Focus on facial expression, eye emotion, mouth position, and overall emotional aura. 
      ${hallucination ? "Include dramatic lighting, color shifts, or surreal elements that enhance the emotion." : "Keep the transformation natural and believable."}
      Be detailed but concise.`

      console.log("Getting Gemini model...")

      // Get the generative model
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

      // Prepare image data for Gemini
      const imagePart = {
        inlineData: {
          data: imageData,
          mimeType: image.startsWith("data:image/png") ? "image/png" : "image/jpeg",
        },
      }

      console.log("Sending request to Gemini...")

      // Generate content with image and prompt
      const result = await model.generateContent([prompt, imagePart])
      const response = await result.response
      const description = response.text()

      console.log("Gemini response received successfully:", description)

      return description
    } catch (error: any) {
      console.error("Gemini API Error:", error)

      // More specific error messages
      if (error.message?.includes("API_KEY_INVALID")) {
        throw new Error("Invalid API key. Please check your Gemini API key.")
      }

      if (error.message?.includes("PERMISSION_DENIED")) {
        throw new Error("Permission denied. Please check your API key permissions.")
      }

      if (error.message?.includes("QUOTA_EXCEEDED")) {
        throw new Error("API quota exceeded. Please check your usage limits.")
      }

      throw new Error(`Failed to process image: ${error.message}`)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        setProcessedImage(null)
        setDescription(null)
        setEmotionValue(0)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHallucinationToggle = (enabled: boolean) => {
    setHallucinationEnabled(enabled)
    // Reset to neutral when toggling
    setEmotionValue(0)
    setDescription(null)
    if (originalImage) {
      handleSliderChange([0])
    }
  }

  const handleSliderChange = async (newValue: number[]) => {
    const emotion = newValue[0]
    setEmotionValue(emotion)

    if (!originalImage) return

    setLoading(true)
    setDescription(null)

    try {
      const result = await processImageWithGemini(emotion, originalImage, hallucinationEnabled)
      setDescription(result)
      setProcessedImage(originalImage) // For now, just show original image
    } catch (error: any) {
      console.error("Error processing image:", error)
      setDescription(`Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const resetToNeutral = () => {
    setEmotionValue(0)
    setDescription(null)
    if (originalImage) {
      handleSliderChange([0])
    }
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
  }

  const currentDisplayImage = processedImage || originalImage

  // Get visible slider ticks based on mode
  const getSliderTicks = () => {
    if (hallucinationEnabled) {
      return [-10, -6, -2, 0, 2, 6, 10]
    }
    return [-2, -1, 0, 1, 2]
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl space-y-8 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Emotion Image Editor</h1>
          <p className="text-gray-600">Upload a portrait and adjust the emotional expression with AI</p>
        </div>

        {/* API Key Input */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="api-key" className="text-sm font-medium whitespace-nowrap">
                Gemini API Key:
              </Label>
              <input
                id="api-key"
                type="password"
                placeholder="Enter your Gemini API key (AIza...)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-2 border border-yellow-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <div className="text-xs text-yellow-700">
                Get your key from{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-yellow-900"
                >
                  Google AI Studio
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Image Upload and Display */}
          <Card className="overflow-hidden lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Image</h2>

              {!originalImage ? (
                <div
                  onClick={triggerFileUpload}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-2">Click to upload a portrait image</p>
                  <p className="text-sm text-gray-500">JPG or PNG format</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      </div>
                    )}
                    <Image
                      src={currentDisplayImage || "/placeholder.svg"}
                      alt="Portrait"
                      fill
                      className={`object-cover transition-all duration-300 ${loading ? "blur-sm" : ""}`}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={triggerFileUpload} variant="outline" size="sm" className="flex-1">
                      <Upload className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                    {processedImage && (
                      <Button onClick={() => setProcessedImage(null)} variant="outline" size="sm">
                        Show Original
                      </Button>
                    )}
                  </div>

                  {fileName && <p className="text-sm text-gray-500 truncate">{fileName}</p>}

                  {/* Gemini Description */}
                  {description && (
                    <Card
                      className={`mt-4 ${description.startsWith("Error:") ? "bg-red-50 border-red-200" : "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <MessageSquare
                            className={`h-5 w-5 mt-0.5 flex-shrink-0 ${description.startsWith("Error:") ? "text-red-600" : "text-blue-600"}`}
                          />
                          <div>
                            <h3
                              className={`font-medium mb-2 ${description.startsWith("Error:") ? "text-red-900" : "text-blue-900"}`}
                            >
                              {description.startsWith("Error:") ? "Error:" : "Gemini's Analysis:"}
                            </h3>
                            <p
                              className={`text-sm leading-relaxed ${description.startsWith("Error:") ? "text-red-800" : "text-blue-800"}`}
                            >
                              {description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Emotion Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Emotion Control
                {hallucinationEnabled && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Hallucination Mode
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hallucination Toggle */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="hallucination-mode"
                    checked={hallucinationEnabled}
                    onCheckedChange={handleHallucinationToggle}
                  />
                  <Label htmlFor="hallucination-mode" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Enable Hallucination
                  </Label>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    {hallucinationEnabled
                      ? "Extreme emotional transformations (-10 to +10)"
                      : "Realistic emotional adjustments (-2 to +2)"}
                  </p>
                </div>
              </div>

              {/* Current Emotion Display */}
              <div className="text-center">
                <div className="text-6xl mb-2">{getCurrentEmotionLabel().emoji}</div>
                <p className="text-lg font-medium text-gray-700">{getCurrentEmotionLabel().text}</p>
                <p className="text-sm text-gray-500">
                  Value: {emotionValue} {hallucinationEnabled && "(Hallucination Mode)"}
                </p>
              </div>

              {/* Emotion Labels */}
              <div className="space-y-4">
                <div className="flex justify-between px-2">
                  {getSliderTicks().map((step) => (
                    <div key={step} className="flex flex-col items-center space-y-1">
                      <span className={`${hallucinationEnabled ? "text-lg" : "text-2xl"}`}>
                        {currentLabels[step.toString() as keyof typeof currentLabels]?.emoji || "❓"}
                      </span>
                      <span className="text-xs text-gray-500 text-center max-w-16">
                        {hallucinationEnabled && Math.abs(step) > 2
                          ? ""
                          : currentLabels[step.toString() as keyof typeof currentLabels]?.text.split(" ")[0] || ""}
                      </span>
                      <span className="text-xs font-mono text-gray-400">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Slider */}
                <div className="px-2">
                  <Slider
                    value={[emotionValue]}
                    onValueChange={handleSliderChange}
                    min={sliderMin}
                    max={sliderMax}
                    step={sliderStep}
                    className={`py-4 ${hallucinationEnabled ? "[&_[role=slider]]:bg-purple-600 [&_[role=slider]]:border-purple-600" : ""}`}
                    disabled={!originalImage || loading || !apiKey}
                  />
                </div>
              </div>

              {/* Reset Button */}
              <Button
                onClick={resetToNeutral}
                variant="outline"
                className="w-full"
                disabled={!originalImage || loading || emotionValue === 0 || !apiKey}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Neutral
              </Button>

              {!originalImage && (
                <p className="text-sm text-gray-500 text-center">Upload an image to start adjusting emotions</p>
              )}

              {!apiKey && originalImage && (
                <p className="text-sm text-yellow-600 text-center">
                  Enter your Gemini API key to enable emotion analysis
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Information */}
        {loading && (
          <Card className={`${hallucinationEnabled ? "bg-purple-50 border-purple-200" : "bg-blue-50 border-blue-200"}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Loader2
                  className={`h-5 w-5 animate-spin ${hallucinationEnabled ? "text-purple-600" : "text-blue-600"}`}
                />
                <p className={`${hallucinationEnabled ? "text-purple-800" : "text-blue-800"}`}>
                  Processing your image with Gemini AI... Emotion level: {emotionValue} (
                  {hallucinationEnabled ? "hallucination" : "realistic"} mode)
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
