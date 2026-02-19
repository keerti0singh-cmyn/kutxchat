# KUTX - Realtime Social Chat Platform

A production-grade realtime social communication platform with chat, stories, and audio calling capabilities.

## Features

- **Secure Authentication**: Email verification, username/email login, password reset
- **Realtime Chat**: Text, image, and document messages with delivery ticks
- **Story System**: 24-hour ephemeral stories with view tracking
- **Audio Calling**: WebRTC-based peer-to-peer audio calls
- **Presence System**: Real-time online/offline status tracking
- **Block System**: Full interaction blocking
- **Responsive UI**: Works from 320px mobile to desktop

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, Zustand
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Calling**: WebRTC with Supabase signaling
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository and navigate to project:
```bash
cd kutx
```

2. Install dependencies:
```bash
npm install
```

3. Create .env.local file with your Supabase credentials

4. Run the development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Database Setup

Run the SQL migration file in Supabase SQL Editor:
- File: supabase/migrations/001_initial_schema.sql

Create storage buckets in Supabase:
- avatars
- stories
- attachments

## Project Structure

```
kutx/
├── app/                    # Next.js App Router
├── components/            # React components
├── lib/                   # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── supabase/              # Database migrations
```

## Environment Variables

NEXT_PUBLIC_SUPABASE_URL - Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY - Your Supabase anonymous key

## License

MIT
