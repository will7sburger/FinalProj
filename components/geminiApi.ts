import { GoogleAuth } from 'google-auth-library'

export const processImageWithGemini = async (args: {
  type: string
  emotion: string
  multiplier: number
  encodedImage: string
}) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process image');
    }

    // Get the response as an array buffer since we're expecting video data
    const videoData = await response.arrayBuffer();
    console.log('Received video data in geminiApi, size:', videoData.byteLength);
    return videoData;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    throw new Error(`Error generating perception: ${errorMessage}`);
  }
};