# BeatGenius AI

A smart step sequencer and beat generator powered by Gemini.

## Features
- **AI Generation**: Type a prompt to generate beats (e.g., "Amapiano groove").
- **Customizable**: Add/Remove tracks (Kick, Snare, HiHat, Synth).
- **Presets**: Built-in styles for Phonk, Afro, Amapiano, etc.
- **Record**: Export your beat as audio.

## Installation

1.  Clone the repository.
2.  Run `npm install` to install dependencies.
3.  Create a `.env` file and add your Google Gemini API key:
    ```
    API_KEY=your_api_key_here
    ```
4.  Run `npm run dev` to start the local server.

## Deployment

### Netlify
1.  Connect your repo to Netlify.
2.  Set the Build Command to `npm run build`.
3.  Set the Publish Directory to `dist`.
4.  Add `API_KEY` in Site Settings > Environment Variables.

### GitHub Pages
1.  Go to Settings > Actions > General and ensure "Read and write permissions" are enabled.
2.  This app uses Vite, so standard GitHub Pages deployment workflows apply.
