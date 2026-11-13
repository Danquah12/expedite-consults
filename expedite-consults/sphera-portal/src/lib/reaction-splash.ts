"use client"

export type SplashReactionKind =
  | "like"
  | "celebrate"
  | "support"
  | "love"
  | "insightful"
  | "funny"
  | string

interface ReactionSplashTheme {
  primaryEmoji: string
  label: string
  accentColor: string
  glowColor: string
  paletteEmojis: string[]
}

const REACTION_SPLASH_THEMES: Record<string, ReactionSplashTheme> = {
  like: {
    primaryEmoji: "👍",
    label: "Liked!",
    accentColor: "#0A66C2",
    glowColor: "rgba(10, 102, 194, 0.38)",
    paletteEmojis: ["👍", "👍", "👍", "💙", "✨", "⚡", "👍", "🌟"],
  },
  thumbs_up: {
    primaryEmoji: "👍",
    label: "Thumbs Up!",
    accentColor: "#0A66C2",
    glowColor: "rgba(10, 102, 194, 0.38)",
    paletteEmojis: ["👍", "👍", "💙", "✨", "⚡", "👍"],
  },
  celebrate: {
    primaryEmoji: "👏",
    label: "Celebrate!",
    accentColor: "#059669",
    glowColor: "rgba(5, 150, 105, 0.38)",
    paletteEmojis: ["👏", "👏", "🎉", "🎊", "🏆", "✨", "🥂", "👏"],
  },
  clap: {
    primaryEmoji: "👏",
    label: "Celebrate!",
    accentColor: "#059669",
    glowColor: "rgba(5, 150, 105, 0.38)",
    paletteEmojis: ["👏", "👏", "🎉", "🎊", "🏆", "✨"],
  },
  support: {
    primaryEmoji: "🤝",
    label: "Support!",
    accentColor: "#0D9488",
    glowColor: "rgba(13, 148, 136, 0.38)",
    paletteEmojis: ["🤝", "🤝", "🙌", "💪", "💚", "✨", "🛡️", "🤝"],
  },
  love: {
    primaryEmoji: "❤️",
    label: "Loved!",
    accentColor: "#E11D48",
    glowColor: "rgba(225, 29, 72, 0.42)",
    paletteEmojis: ["❤️", "❤️", "💖", "💗", "💘", "❤️", "✨", "🥰"],
  },
  heart: {
    primaryEmoji: "❤️",
    label: "Loved!",
    accentColor: "#E11D48",
    glowColor: "rgba(225, 29, 72, 0.42)",
    paletteEmojis: ["❤️", "❤️", "💖", "💗", "💘", "✨"],
  },
  insightful: {
    primaryEmoji: "💡",
    label: "Insightful!",
    accentColor: "#D97706",
    glowColor: "rgba(217, 119, 6, 0.40)",
    paletteEmojis: ["💡", "💡", "🧠", "⚡", "🌟", "✨", "🚀", "💡"],
  },
  bulb: {
    primaryEmoji: "💡",
    label: "Insightful!",
    accentColor: "#D97706",
    glowColor: "rgba(217, 119, 6, 0.40)",
    paletteEmojis: ["💡", "💡", "🧠", "⚡", "🌟", "✨"],
  },
  funny: {
    primaryEmoji: "😂",
    label: "Funny!",
    accentColor: "#EA580C",
    glowColor: "rgba(234, 88, 12, 0.40)",
    paletteEmojis: ["😂", "😂", "🤣", "😄", "✨", "😂", "🎉", "🤣"],
  },
  laugh: {
    primaryEmoji: "😂",
    label: "Funny!",
    accentColor: "#EA580C",
    glowColor: "rgba(234, 88, 12, 0.40)",
    paletteEmojis: ["😂", "😂", "🤣", "😄", "✨"],
  },
  fire: {
    primaryEmoji: "🔥",
    label: "Fire!",
    accentColor: "#DC2626",
    glowColor: "rgba(220, 38, 38, 0.40)",
    paletteEmojis: ["🔥", "🔥", "⚡", "💥", "✨", "🚀"],
  },
}

/**
 * Triggers a full-screen reaction emoji splash across the viewport
 * whenever a user clicks Like, Celebrate, Support, Love, Insightful, Funny, etc.
 */
export function triggerReactionSplash(
  kind: SplashReactionKind,
  event?: { clientX?: number; clientY?: number } | null
) {
  if (typeof window === "undefined" || typeof document === "undefined") return

  const key = String(kind || "like").toLowerCase().trim()
  const theme: ReactionSplashTheme = REACTION_SPLASH_THEMES[key] || {
    primaryEmoji: "👍",
    label: "Reacted!",
    accentColor: "#0A66C2",
    glowColor: "rgba(10, 102, 194, 0.38)",
    paletteEmojis: ["👍", "❤️", "👏", "💡", "✨"],
  }

  const vw = window.innerWidth || 1200
  const vh = window.innerHeight || 800
  const originX =
    event && typeof event.clientX === "number" && event.clientX > 0
      ? event.clientX
      : vw * 0.5
  const originY =
    event && typeof event.clientY === "number" && event.clientY > 0
      ? event.clientY
      : vh * 0.65

  const container = document.createElement("div")
  container.setAttribute("aria-hidden", "true")
  Object.assign(container.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483647",
    overflow: "hidden",
  })
  document.body.appendChild(container)

  // 1. Center / Origin Hero Splash Badge (Big Emoji + Reaction Label)
  const heroBadge = document.createElement("div")
  Object.assign(heroBadge.style, {
    position: "fixed",
    left: `${Math.min(Math.max(originX, 140), vw - 140)}px`,
    top: `${Math.min(Math.max(originY - 40, 120), vh - 120)}px`,
    transform: "translate(-50%, -50%) scale(0.3)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "14px 26px",
    borderRadius: "9999px",
    background: "rgba(23, 21, 19, 0.92)",
    border: `2.5px solid ${theme.accentColor}`,
    boxShadow: `0 18px 50px ${theme.glowColor}, 0 0 0 6px rgba(255,255,255,0.14)`,
    color: "#FAF7F2",
    fontFamily: "system-ui, -apple-system, sans-serif",
    fontWeight: "900",
    zIndex: "2147483647",
    willChange: "transform, opacity",
  })

  const heroEmoji = document.createElement("div")
  heroEmoji.textContent = theme.primaryEmoji
  Object.assign(heroEmoji.style, {
    fontSize: "54px",
    lineHeight: "1",
    filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.35))",
  })

  const heroText = document.createElement("div")
  heroText.textContent = `${theme.primaryEmoji} ${theme.label}`
  Object.assign(heroText.style, {
    fontSize: "15px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#FFFFFF",
    whiteSpace: "nowrap",
  })

  heroBadge.appendChild(heroEmoji)
  heroBadge.appendChild(heroText)
  container.appendChild(heroBadge)

  if (typeof heroBadge.animate === "function") {
    heroBadge.animate(
      [
        { transform: "translate(-50%, -20%) scale(0.25)", opacity: 0 },
        { transform: "translate(-50%, -65%) scale(1.18)", opacity: 1, offset: 0.22 },
        { transform: "translate(-50%, -85%) scale(1.0)", opacity: 1, offset: 0.65 },
        { transform: "translate(-50%, -140%) scale(0.85)", opacity: 0 },
      ],
      {
        duration: 1550,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
        fill: "forwards",
      }
    )
  }

  // 2. Radial Burst Particles from Click Origin (16 emojis shooting outward & upward)
  const burstCount = 16
  for (let i = 0; i < burstCount; i++) {
    const particle = document.createElement("div")
    const emoji = theme.paletteEmojis[i % theme.paletteEmojis.length]
    particle.textContent = emoji
    const sizePx = 28 + (i % 4) * 8 // 28px to 52px
    Object.assign(particle.style, {
      position: "fixed",
      left: `${originX}px`,
      top: `${originY}px`,
      fontSize: `${sizePx}px`,
      lineHeight: "1",
      userSelect: "none",
      filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.22))",
      willChange: "transform, opacity",
    })
    container.appendChild(particle)

    const angle = (Math.PI * 2 * i) / burstCount - Math.PI / 2
    const spreadX = Math.cos(angle) * (110 + (i % 5) * 45)
    const spreadY = Math.sin(angle) * (95 + (i % 4) * 35) - 140
    const rot = ((i % 2 === 0 ? 1 : -1) * (18 + (i * 11) % 45))

    if (typeof particle.animate === "function") {
      particle.animate(
        [
          {
            transform: "translate(-50%, -50%) scale(0.2) rotate(0deg)",
            opacity: 0,
          },
          {
            transform: `translate(calc(-50% + ${spreadX * 0.45}px), calc(-50% + ${spreadY * 0.45}px)) scale(1.25) rotate(${rot * 0.5}deg)`,
            opacity: 1,
            offset: 0.25,
          },
          {
            transform: `translate(calc(-50% + ${spreadX}px), calc(-50% + ${spreadY - 90}px)) scale(0.9) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1250 + (i % 5) * 140,
          delay: (i % 4) * 35,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        }
      )
    }
  }

  // 3. Full-Screen Rising Emoji Fountain Across the Entire Screen (22 big emojis rising across the viewport)
  const fountainCount = 22
  for (let j = 0; j < fountainCount; j++) {
    const floater = document.createElement("div")
    const emoji =
      j % 2 === 0
        ? theme.primaryEmoji
        : theme.paletteEmojis[j % theme.paletteEmojis.length]
    floater.textContent = emoji
    const fontSize = 32 + (j % 4) * 10 // 32px to 62px
    const startX = ((j + 0.5) / fountainCount) * vw + ((j % 3) - 1) * 24
    const startY = vh - 30 - (j % 5) * 45
    const driftX = ((j % 2 === 0 ? 1 : -1) * (30 + (j * 17) % 80))
    const riseY = -(vh * (0.48 + (j % 4) * 0.12))
    const spinDeg = (j % 2 === 0 ? 1 : -1) * (15 + (j * 9) % 35)

    Object.assign(floater.style, {
      position: "fixed",
      left: `${startX}px`,
      top: `${startY}px`,
      fontSize: `${fontSize}px`,
      lineHeight: "1",
      userSelect: "none",
      filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.22))",
      willChange: "transform, opacity",
    })
    container.appendChild(floater)

    if (typeof floater.animate === "function") {
      floater.animate(
        [
          {
            transform: "translate(-50%, 20px) scale(0.3) rotate(0deg)",
            opacity: 0,
          },
          {
            transform: `translate(calc(-50% + ${driftX * 0.4}px), ${riseY * 0.35}px) scale(1.15) rotate(${spinDeg * 0.5}deg)`,
            opacity: 1,
            offset: 0.25,
          },
          {
            transform: `translate(calc(-50% + ${driftX * 0.8}px), ${riseY * 0.75}px) scale(1.05) rotate(${spinDeg}deg)`,
            opacity: 0.92,
            offset: 0.7,
          },
          {
            transform: `translate(calc(-50% + ${driftX}px), ${riseY}px) scale(0.75) rotate(${spinDeg * 1.2}deg)`,
            opacity: 0,
          },
        ],
        {
          duration: 1450 + (j % 6) * 130,
          delay: (j % 7) * 45,
          easing: "cubic-bezier(0.2, 0.9, 0.3, 1)",
          fill: "forwards",
        }
      )
    }
  }

  window.setTimeout(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }
  }, 2400)
}
