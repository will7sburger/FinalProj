# Emotion Image Editor

A Next.js application that allows users to upload portrait images and adjust emotional expressions using AI.

## Features

- Upload portrait images (JPG/PNG)
- Adjust emotions from -2 to +2 (realistic mode)
- Enable "Hallucination Mode" for extreme emotions (-10 to +10)
- Real-time image processing simulation
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Run the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## How to Use

1. **Upload an Image**: Click the upload area and select a portrait image (JPG or PNG)
2. **Adjust Emotions**: Use the slider to change emotional expression (-2 to +2)
3. **Enable Hallucination**: Toggle the switch for extreme emotions (-10 to +10)
4. **Reset**: Click "Reset to Neutral" to return to emotion level 0

## Project Structure

\`\`\`
├── app/
│   ├── api/update-image/route.ts    # API endpoint for image processing
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Main page component
├── components/ui/                   # Reusable UI components
├── lib/utils.ts                     # Utility functions
└── public/                          # Static assets
\`\`\`

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Language**: TypeScript

## API Integration

The app includes mock API responses. To integrate with real AI services:

1. Replace the mock API in `app/api/update-image/route.ts`
2. Add your API keys to environment variables
3. Implement actual image processing logic

## Troubleshooting

### Common Issues

1. **Dependencies not installing**: Delete `node_modules` and `package-lock.json`, then run `npm install`
2. **Port already in use**: Change the port with `npm run dev -- -p 3001`
3. **TypeScript errors**: Run `npm run lint` to check for issues

### Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure you're using Node.js 18+
