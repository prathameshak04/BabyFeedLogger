# BabyFeed AI — Smart Feeding Logger

A progressive web app (PWA) that helps parents track baby feeding sessions, diaper changes, and get AI-powered insights about their baby's patterns and developmental milestones.

## Features

- 🍼 **Feeding Timer** — Start/stop timer with left breast, right breast, or bottle selection
- 💩 **Diaper Tracking** — Log diaper changes with color and consistency details
- 📊 **Today's Stats** — Feeds count, average duration, last feed time, total time
- 🎯 **Milestones** — Age-based developmental milestones (birth to 2 years)
- 🧠 **AI Insights** — 15 types of heuristic analysis including:
  - Feeding frequency, duration, and regularity
  - Day vs night ratio analysis
  - Growth spurt detection
  - Breast side balance
  - Poop-to-feed correlation
  - Stool color and consistency alerts
  - Age-appropriate tips
- 📋 **Activity Log** — Combined feed + diaper timeline with date grouping
- ⏱️ **Background Safe** — Timer works even when screen is locked
- 📱 **PWA** — Installable on iPhone/Android home screen, works offline
- 💾 **localStorage** — All data persists locally, no server needed

## Getting Started

1. Open `index.html` in a browser, or
2. Deploy to any static hosting (Netlify, GitHub Pages, Vercel)
3. On iPhone: Safari → Share → Add to Home Screen

## Tech Stack

- Vanilla HTML, CSS, JavaScript
- Service Worker for offline caching
- localStorage for data persistence
- No dependencies, no build step
