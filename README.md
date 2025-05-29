# Emotion Image Editor

A Next.js-based application that enables users to upload portrait images and adjust facial emotional expressions using AI.

This project focuses on augmenting human creativity by allowing fine control over facial expressions for purposes such as digital art, storytelling, and perceptual research.

## Features

- Upload portrait images (JPG or PNG)
- Adjust emotional expression using a slider ranging from -2 to +2 (realistic mode)
- Enable "Hallucination Mode" to expand slider range to -10 to +10 for more exaggerated emotional outputs
- Real-time visual feedback
- Responsive and accessible interface for both desktop and mobile

## Getting Started

### Prerequisites

- Node.js version 18 or later
- npm or yarn package manager

### Installation

```bash
npm install
```

### Running the Development Server

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## Usage Guide

1. **Upload Image**  
   Select a JPG or PNG portrait image using the upload interface.

2. **Adjust Emotion**  
   Use the slider to apply subtle emotion changes between -2 and +2.

3. **Hallucination Mode**  
   Toggle to enable hallucination mode, expanding the slider to -10 to +10 for extreme emotional transformations.

4. **Reset to Neutral**  
   Reset the emotion level to 0 and restore the original image.

## Project Structure

```
├── app/
│   ├── api/update-image/route.ts     # API endpoint for processing image edits
│   ├── layout.tsx                    # Application layout
│   ├── page.tsx                      # Main component logic
│   └── globals.css                   # Global styling
├── components/ui/                    # Custom UI components (slider, toggle, image display)
├── lib/utils.ts                      # Utility functions
├── public/                           # Static assets and fallback images
├── README.md                         # Documentation
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **UI Library**: Radix UI
- **Icons**: Lucide React
- **Language**: TypeScript

## API Integration

Currently, the application uses mock responses. To integrate real AI processing:

1. Replace mock logic in `app/api/update-image/route.ts`
2. Add your API key to `.env.local`:
   ```
   GEMINI_API_KEY=your_key_here
   ```
3. Implement actual prompt-based image transformation logic using an AI model such as Gemini or Stable Diffusion.

## Troubleshooting

### Common Issues

| Issue                      | Solution                                                  |
|---------------------------|-----------------------------------------------------------|
| Installation failure      | Delete `node_modules` and `package-lock.json`, reinstall |
| Port already in use       | Run with `npm run dev -- -p 3001`                         |
| TypeScript errors         | Run `npm run lint`                                        |
| Image not displaying      | Check console for errors and validate API responses       |

## License and Contributions

This project is a prototype exploring AI-assisted image editing in the creative domain. Contributions and feedback are welcome.
