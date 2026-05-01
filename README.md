# Cadence

A premium, design-forward habit tracker with Strava integration. Built for consistency and focus.

![Dashboard Preview](public/icons/icon.png)

## Features

- **Habit Tracking**: Daily checklist with animated feedback and streaks.
- **Strava Integration**: Automatically sync your runs and rides. Auto-logs habits based on activity types.
- **Visual Progress**: 6-month activity heatmap and detailed charts.
- **Goal Setting**: Weekly distance goals for Strava activities.
- **PWA Ready**: Installable on mobile and desktop for a native-like experience.
- **Dark Mode**: Optimized for low-light focus.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Neon Postgres](https://neon.tech/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Auth**: [NextAuth.js](https://next-auth.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Maps**: [Leaflet](https://leafletjs.com/)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Cadence
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` (or `.env.local`) file in the root directory and add the following:

```env
DATABASE_URL="postgresql://user:password@host/neondb?sslmode=require"

NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

STRAVA_CLIENT_ID="your-client-id"
STRAVA_CLIENT_SECRET="your-client-secret"
STRAVA_REDIRECT_URI="http://localhost:3000/api/strava/callback"
```

### 4. Database Setup

```bash
npx prisma db push
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

Deploy to [Vercel](https://vercel.com) with a single click. Ensure all environment variables are set in the Vercel dashboard.

## License

MIT
