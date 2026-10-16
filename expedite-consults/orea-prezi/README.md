# OREA-PREZI | Interactive Spatial Presentation Platform

A dynamic, web-based, Prezi-style spatial presentation engine built for **OREA (Ontario Real Estate Association)** and modern enterprise presentations.

---

## 🌟 Key Capabilities

- **2D/3D Infinite Zooming Canvas**:
  - Prezi-inspired camera transitions smoothly scaling and panning between the Macro Ecosystem Map and individual topic slides.
  - Interactive mouse drag / pan and continuous wheel zoom.
  - Constellation connection network linking all 6 strategic pillars and nodes.

- **6 Strategic Presentation Clusters**:
  1. **Strategic Vision & Governance**: Executive thesis, market metrics, and association transformation.
  2. **Standard Forms 2.0 & TRESA Suite**: Interactive comparison matrix between legacy paper forms vs. smart digital contracts.
  3. **Unified MLS Data Fabric & PropTech Interoperability**: Clickable 3-tier real-time data architecture diagram (RESO 2.0, MPAC, GraphQL).
  4. **OreaAI & Advanced Member Analytics**: Agent Listing Copilot, automated compliance safeguards, and predictive pricing radar.
  5. **Advocacy, Housing Supply & Education**: 1.5M homes policy, gentle density reforms, and on-demand micro-credentials.
  6. **Transformation Roadmap & ROI Delivery**: Interactive 4-phase rollout timeline and dynamic ROI calculator for brokerages.

- **Presenter Suite & Tooling**:
  - **Speaker Teleprompter Notes Drawer (`N`)**: Live speaking cues, talking points, and duration timer.
  - **Spatial Radar MiniMap**: Real-time camera viewport tracker and click-to-pan locator.
  - **Slide Outline Drawer**: Categorized chapter directory with instant slide jumping.
  - **Synthesized Web Audio FX (`M`)**: Whoosh zoom sound effects, UI clicks, and milestone completion chimes without external audio files.
  - **Autoplay Loop (`P`)**: Automated self-advancing presentation mode.
  - **Milestone Celebration**: Built-in dynamic confetti launcher (`canvas-confetti`).

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| **`Space`** or **`→`** | Advance to next slide |
| **`←`** | Return to previous slide |
| **`Esc`** or **`O`** | Zoom out to Macro Overview Constellation |
| **`F`** | Toggle Fullscreen mode |
| **`N`** | Toggle Presenter Teleprompter Notes drawer |
| **`M`** | Toggle Web Audio sound effects (Mute/Unmute) |
| **`P`** | Toggle Autoplay playback |
| **`?`** | Open Keyboard shortcuts cheatsheet |
| **Click + Drag** | Pan canvas freely |
| **Mouse Wheel** | Continuous zoom in / out |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 📁 Architecture

```text
orea-prezi/
├── app/
│   ├── layout.tsx                # App layout & dark metadata
│   ├── page.tsx                  # Master presentation container
│   └── globals.css               # Cyber grid, glassmorphism & themes
├── components/
│   ├── canvas/
│   │   ├── ZoomCanvas.tsx        # Spatial 2D/3D camera & viewport engine
│   │   ├── CenterBeacon.tsx      # Master OREA strategic hub
│   │   ├── ClusterNode.tsx       # Constellation topic clusters
│   │   ├── SlideCard.tsx         # High-resolution interactive slide cards
│   │   └── ConstellationLines.tsx # Dynamic SVG connection lines
│   ├── controls/
│   │   ├── PresenterControls.tsx # Top & bottom floating navigation HUDs
│   │   ├── MiniMap.tsx           # Spatial radar map
│   │   ├── PresenterNotes.tsx    # Teleprompter speaker drawer
│   │   ├── SlideDrawer.tsx       # Slide & cluster outline directory
│   │   └── HelpModal.tsx         # Keyboard shortcuts modal
│   └── widgets/
│       ├── MetricsGrid.tsx       # Animated KPI metrics cards
│       ├── ComparisonMatrix.tsx  # Interactive legacy vs. OREA 2.0 comparison
│       ├── ArchitectureDiagram.tsx # Clickable 3-tier tech stack
│       ├── TimelineFlow.tsx      # 4-Phase interactive roadmap tabs
│       └── RoiCalculator.tsx     # Dynamic brokerage savings slider
├── data/
│   └── presentation-data.ts      # Complete presentation clusters & slides
└── lib/
    ├── types.ts                  # TypeScript schema definitions
    ├── use-presentation.ts       # Central navigation & camera state hook
    └── audio.ts                  # Web Audio API sound synthesizer
```
