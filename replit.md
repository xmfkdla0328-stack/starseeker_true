# Star Seeker: Project Infinity

## Overview
A web-based RPG game built with React. Features a sci-fi/fantasy theme with characters (Allies), enemies, a story progression system (Causality Tree), resource mining, and a gacha mechanic for acquiring characters/equipment. Includes a real-time tick-based battle engine.

## Tech Stack
- **Frontend:** React 18.2.0
- **Build Tool:** Vite 5.2.0
- **Styling:** Tailwind CSS 3.4.3 + PostCSS + Autoprefixer
- **Icons:** Lucide React
- **Package Manager:** npm

## Project Structure
```
star-seeker/         # Main frontend app
  src/
    components/      # UI components (battle, common, event, gacha, management, mining, guidebook)
    data/            # Static game data (characters, enemies, stories, skills)
    hooks/           # Custom React hooks (battle logic, game data)
    router/          # State-based navigation (GameRouter)
    screens/         # High-level screen components
    App.jsx          # Root component
    main.jsx         # Entry point
  public/            # Static assets (audio, character/enemy images)
  vite.config.js     # Vite configuration
  package.json
```

## Development
- Run: `cd star-seeker && npm run dev`
- Runs on port 5000 (0.0.0.0 host, all hosts allowed for Replit proxy)

## Deployment
- Type: Static site
- Build: `cd star-seeker && npm run build`
- Public dir: `star-seeker/dist`

## Key Notes
- Navigation is state-based (no react-router), managed by `useGameNavigation` hook and `GameRouter`
- Battle system uses `setInterval` tick loop in `useBattle.js` + `battleTick.js`
- Mobile-first UI design (`max-w-md mx-auto`, `h-[100dvh]`)
