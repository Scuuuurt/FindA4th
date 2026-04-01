# FindA4th

FindA4th is a shareable React demo for matching golfers into open tee time spots.

## Demo Hosting

This repo is ready for a frontend-only deployment using the built-in local demo data.
That is the fastest way to send a link to friends for product feedback.

### Recommended: Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Import the `Scuuuurt/FindA4th` repository.
3. Keep the default framework as `Vite`.
4. Deploy without adding any environment variables.

The hosted app will run in demo mode automatically as long as you do not add `?backend=1` to the URL.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/`.

## Full Stack Local Mode

```bash
npm install
npm run dev:full
```

Open `http://localhost:5173/?backend=1` to use the Express API locally.
