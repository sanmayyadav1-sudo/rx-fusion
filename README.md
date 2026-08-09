This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Deploy on Netlify

This repository is configured for one-click deployment on **Netlify**.

### Deployment Setup

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket).
2. Log in to [Netlify](https://app.netlify.com/) and click **"Add new site" > "Import an existing project"**.
3. Select your repository.
4. Netlify will auto-detect the configuration settings from [`netlify.toml`](file:///e:/Plugins/Get%20Shit%20Done/rx-fusion-main/rx-fusion-main/netlify.toml):
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.next`
   - **Node.js Version**: `20`
5. Configure Environment Variables under **Site configuration > Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anonymous Key
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase Service Role Key (for server actions/API routes)
6. Click **Deploy site**.

Netlify will automatically build the Next.js App Router application using `@netlify/plugin-nextjs`, handling SSR, dynamic routes, API routes, and middleware.
