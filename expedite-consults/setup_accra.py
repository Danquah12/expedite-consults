import os

base_dir = r"d:\Anti-gravity\expedite-consults\expedite-consults\accra-helsinki-platform"

files = {
    "package.json": """{
  "name": "accra-helsinki-platform",
  "private": true,
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "format": "prettier --write \\"**/*.{ts,tsx,md,json}\\""
  },
  "devDependencies": {
    "prettier": "^3.0.0",
    "turbo": "^2.0.0"
  },
  "packageManager": "pnpm@9.0.0"
}""",
    "pnpm-workspace.yaml": """packages:
  - "apps/*"
  - "packages/*"
""",
    "turbo.json": """{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}""",
    ".gitignore": """node_modules
.pnp
.pnp.js
.next/
out/
build
.DS_Store
*.pem
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*.local
.env
.vercel
*.tsbuildinfo
.idea/
.vscode/
.turbo
""",
    ".env.example": """# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Strapi
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
STRAPI_API_TOKEN=your_strapi_api_token

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_secret_key

# Resend
RESEND_API_KEY=your_resend_api_key
""",
    "README.md": """# CSRTA Africa Environmental Intelligence Platform

## Overview
Accra-Helsinki Platform monorepo using Next.js 15, Turborepo, pnpm.

## Getting Started

1. Install dependencies: `pnpm install`
2. Start development servers: `pnpm run dev`
""",
    "docker-compose.yml": """version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: strapi
      POSTGRES_PASSWORD: password
      POSTGRES_DB: strapidb
    volumes:
      - data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  data:
""",
    "apps/web/package.json": """{
  "name": "web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.9.0",
    "@radix-ui/react-accordion": "^1.2.0",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-checkbox": "^1.1.1",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-popover": "^1.1.1",
    "@radix-ui/react-scroll-area": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-switch": "^1.1.0",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@supabase/supabase-js": "^2.45.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "date-fns": "^3.6.0",
    "framer-motion": "^11.5.0",
    "leaflet": "^1.9.4",
    "lucide-react": "^0.436.0",
    "next": "15.0.0-rc.0",
    "next-auth": "5.0.0-beta.32",
    "next-intl": "^3.19.0",
    "react": "^19.0.0-rc.0",
    "react-dom": "^19.0.0-rc.0",
    "react-hook-form": "^7.53.0",
    "react-leaflet": "^4.2.1",
    "react-player": "^2.16.0",
    "recharts": "^2.12.7",
    "sharp": "^0.33.5",
    "tailwind-merge": "^2.5.2",
    "tailwindcss": "^4.0.0-alpha.20",
    "@tailwindcss/postcss": "^4.0.0-alpha.20",
    "zod": "^3.23.8",
    "zustand": "^4.5.5"
  },
  "devDependencies": {
    "@types/leaflet": "^1.9.12",
    "@types/node": "^20.14.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "postcss": "^8.4.41",
    "typescript": "^5.5.4"
  }
}""",
    "apps/web/tsconfig.json": """{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}""",
    "apps/web/next.config.ts": """import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;""",
    "apps/web/postcss.config.mjs": """export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};""",
    "apps/web/app/globals.css": """@import 'tailwindcss';

@theme {
  --color-brand-primary: #064E3B;
  --color-brand-secondary: #065F46;
  --color-brand-accent: #059669;
  --color-brand-amber: #D97706;
  --color-brand-dark: #0F172A;
  --font-sans: 'Inter', sans-serif;
}

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 157 86% 16%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 157 86% 20%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 157 93% 30%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 157 86% 16%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 157 86% 16%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 157 86% 20%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 157 93% 30%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 157 86% 16%;
  }
}
 
@layer base {
  * {
    border-color: var(--border);
  }
  body {
    background-color: var(--background);
    color: var(--foreground);
  }
}""",
    "apps/web/next-env.d.ts": """/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
""",
    "apps/web/components.json": """{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}""",
    "apps/web/lib/utils.ts": """import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}""",
    ".github/workflows/deploy-web.yml": """name: Deploy Web

on:
  push:
    branches: ["main"]
  pull_request:
    branches: ["main"]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9
          
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: 'pnpm'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Lint
        run: pnpm run lint
        
      - name: Build
        run: pnpm run build
"""
}

for path, content in files.items():
    full_path = os.path.join(base_dir, path.replace("/", "\\\\"))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files created successfully.")
