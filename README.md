# WNBA Media Narratives

An interactive visualization of media coverage patterns for WNBA players and teams.

## Project Structure

```
├── app/
│   ├── page.tsx          # Main server-side page
│   ├── layout.tsx        # Root layout with metadata
│   └── globals.css       # Global styles
├── src/
│   ├── components/
│   │   ├── EntityList.tsx        # Reusable component for displaying players/teams
│   │   ├── HeadlinesDisplay.tsx  # Full-screen headline viewer
│   │   └── PlayerView.tsx        # Client-side state management
│   ├── data/
│   │   ├── player-headlines.csv  # Player data with headline IDs
│   │   ├── all-headlines.csv     # Complete headline database
│   │   └── teams_*.csv           # Team data (for future use)
│   ├── lib/
│   │   ├── data.ts               # CSV data loading (uses csv-parse library)
│   │   └── textAnalysis.ts       # NLP analysis with RiTa and sentiment analysis
│   └── types/
│       └── index.ts              # TypeScript type definitions
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
