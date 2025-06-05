"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, ImageIcon, Sparkles, Zap, Heart, Frown, Flame, AlertTriangle, Camera, Wand2 } from "lucide-react"
import { processImageWithGemini } from "@/components/geminiApi"

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [type, setType] = useState<"Scenery" | "Faces">("Scenery")
  const [emotion, setEmotion] = useState<"happy" | "sad" | "angry" | "afraid">("happy")
  const [multiplier, setMultiplier] = useState<number>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  // Helper function to extract base64 data from data URL
  const getBase64FromDataUrl = (dataUrl: string): string => {
    // Check if it's a data URL
    if (dataUrl && dataUrl.split(",")[0].indexOf("base64") >= 0) {
      // Return the base64 part
      return dataUrl.split(",")[1]
    }
    return ""
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && (file.type === "image/jpeg" || file.type === "image/png")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas with 16:9 aspect ratio
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          // Set target dimensions maintaining 16:9 ratio
          const targetWidth = 1280 // standard HD width
          const targetHeight = 720 // standard HD height (16:9)
          
          canvas.width = targetWidth
          canvas.height = targetHeight
          
          if (ctx) {
            // Fill with black background
            ctx.fillStyle = 'black'
            ctx.fillRect(0, 0, targetWidth, targetHeight)
            
            // Calculate scaling and position to maintain aspect ratio
            const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
            const scaledWidth = img.width * scale
            const scaledHeight = img.height * scale
            const x = (targetWidth - scaledWidth) / 2
            const y = (targetHeight - scaledHeight) / 2
            
            // Draw image centered
            ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
            
            // Convert to base64
            const resizedImage = canvas.toDataURL(file.type)
            setUploadedImage(resizedImage)
            setResult(null)
          }
        }
        img.src = event.target?.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  const GeneratePerception = async (args: {
    type: string
    emotion: string
    multiplier: number
    encodedImage: string
  }) => {
    setIsGenerating(true)
    setResult(null)

    try {
      console.log("Generating Perception with:", args)

      // Call the Gemini processing function
      const response = await processImageWithGemini(args)
      console.log('Video data received on frontend');
      
      // The API returns a Blob
      const videoBlob = new Blob([response], { type: 'video/mp4' });
      console.log('Created video blob, size:', videoBlob.size);
      
      const videoUrl = URL.createObjectURL(videoBlob)
      console.log('Video URL created, ready for display');
      setResult(videoUrl)
    } catch (error) {
      console.error("Error generating perception:", error)
      setResult("Error generating perception. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const emotionConfig = {
    happy: { icon: Heart, color: "from-pink-500 to-rose-500", bg: "bg-pink-50", border: "border-pink-200" },
    sad: { icon: Frown, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50", border: "border-blue-200" },
    angry: { icon: Flame, color: "from-red-500 to-orange-500", bg: "bg-red-50", border: "border-red-200" },
    afraid: {
      icon: AlertTriangle,
      color: "from-purple-500 to-violet-500",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
  }

  const multiplierLabels = {
    1: { label: "Normal", color: "text-green-600", emoji: "😊" },
    2: { label: "High", color: "text-yellow-600", emoji: "🤯" },
    3: { label: "Hallucination", color: "text-red-600", emoji: "🌈" },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            ✨ Emocio ✨
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your images with emotional perception! Upload, select, and watch the magic happen.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Image Upload */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <ImageIcon className="w-4 h-4" />
                Image Workspace
              </div>
            </div>

            <div className="relative group">
              {uploadedImage ? (
                <div className="relative overflow-hidden rounded-2xl border-4 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded"
                    className="w-full h-80 object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ) : (
                <div
                  className="h-80 border-4 border-dashed border-purple-300 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 flex flex-col items-center justify-center transition-all duration-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-100 hover:to-pink-100 cursor-pointer group"
                  onClick={handleUploadClick}
                >
                  <div className="text-center">
                    <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
                    <p className="text-xl font-semibold text-purple-600 mb-2">Drop your image here</p>
                    <p className="text-gray-500">or click to browse</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center mt-6">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 mx-auto"
                onClick={handleUploadClick}
              >
                <Upload className="w-5 h-5" />
                {uploadedImage ? "Change Image" : "Upload Image"}
              </button>
            </div>

            {/* Results Section */}
            {result && (
              <div className="mt-6 p-4 bg-white/90 rounded-xl border border-purple-200 shadow-md">
                <h3 className="text-lg font-semibold text-purple-700 mb-2">Generated Video:</h3>
                <div className="relative w-full aspect-video">
                  <video 
                    controls 
                    className="w-full h-full rounded-lg shadow-lg"
                    src={result}
                    onLoadedData={() => {
                      console.log('Video loaded and ready to play');
                      console.log('finished');
                    }}
                    onError={(e) => console.error('Video loading error:', e)}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Controls */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Type Selection */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-purple-500" />
                Analysis Type
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {(["Scenery", "Faces"] as const).map((typeOption) => (
                  <button
                    key={typeOption}
                    className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                      type === typeOption
                        ? "border-purple-500 bg-gradient-to-br from-purple-100 to-pink-100 shadow-lg"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50"
                    }`}
                    onClick={() => setType(typeOption)}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">{typeOption === "Scenery" ? "🏞️" : "👥"}</div>
                      <div className={`font-semibold ${type === typeOption ? "text-purple-700" : "text-gray-600"}`}>
                        {typeOption}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Emotion Selection */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                Emotion Filter
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(emotionConfig) as Array<keyof typeof emotionConfig>).map((emotionOption) => {
                  const config = emotionConfig[emotionOption]
                  const IconComponent = config.icon
                  return (
                    <button
                      key={emotionOption}
                      className={`p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 ${
                        emotion === emotionOption
                          ? `border-transparent bg-gradient-to-r ${config.color} text-white shadow-lg`
                          : `border-gray-200 ${config.bg} hover:${config.border} hover:shadow-md`
                      }`}
                      onClick={() => setEmotion(emotionOption)}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-semibold capitalize">{emotionOption}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Multiplier */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-purple-500" />
                Intensity Level
              </h3>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                <input
                  type="range"
                  className="w-full h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-200 rounded-lg appearance-none cursor-pointer slider"
                  min="1"
                  max="3"
                  step="1"
                  value={multiplier}
                  onChange={(e) => setMultiplier(Number(e.target.value))}
                />
                <div className="flex justify-between mt-4">
                  {Object.entries(multiplierLabels).map(([value, config]) => (
                    <div
                      key={value}
                      className={`text-center transition-all duration-300 ${
                        multiplier === Number(value) ? `${config.color} scale-110 font-bold` : "text-gray-400"
                      }`}
                    >
                      <div className="text-2xl mb-1">{config.emoji}</div>
                      <div className="text-sm font-medium">{config.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                className={`w-full py-4 px-8 rounded-2xl font-bold text-lg shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 ${
                  isGenerating || !uploadedImage
                    ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white hover:shadow-2xl"
                }`}
                onClick={() => {
                  if (!uploadedImage) {
                    alert("Please upload an image first!")
                    return
                  }

                  // Extract base64 data from the data URL
                  const base64EncodedData = getBase64FromDataUrl(uploadedImage)

                  GeneratePerception({
                    type,
                    emotion,
                    multiplier,
                    encodedImage: base64EncodedData, // Now passing just the base64 part
                  })
                }}
                disabled={isGenerating || !uploadedImage}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    Generating Magic...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-6 h-6" />
                    Generate Perception ✨
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 24px;
          width: 24px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
        }
        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}
