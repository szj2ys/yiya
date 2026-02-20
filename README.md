# Yiya

> **Mission: Make daily language learning feel effortless.**
>
> See [docs/MISSION.md](docs/MISSION.md) for our full mission, vision, and strategic direction.

## Key Features

- 🌐 Next.js 14 & server actions
- 🗣 Audio pronunciations
- 🎨 Beautiful component system using Shadcn UI
- 🎭 Amazing characters thanks to KenneyNL
- 🔐 Auth using Clerk
- 🔊 Sound effects
- ❤️ Hearts system
- 🌟 Points / XP system
- 💔 No hearts left popup
- 🚪 Exit confirmation popup
- 🔄 Practice old lessons to regain hearts
- 🏆 Leaderboard
- 🗺 Quests milestones
- 🛍 Shop system to exchange points with hearts
- 💳 Pro tier for unlimited hearts using Stripe
- 🏠 Landing page
- 📊 Admin dashboard React Admin
- 🌧 ORM using DrizzleORM
- 💾 PostgresDB using NeonDB
- 🚀 Deployment on Vercel
- 📱 Mobile responsiveness

### Prerequisites

**Node version 18.x or higher**

### Cloning the repository

```shell
git clone https://github.com/szj2ys/yiya.git
```

### Install packages

```shell
npm i
```

### Setup .env.local file

Copy `.env.example` and fill in your values:

```shell
cp .env.example .env.local
```

### Setup Drizzle ORM

```shell
npm run db:push
```

### Seed the app

```shell
npm run db:seed
```

### Start the app

```shell
npm run dev
```
