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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


resilience 


Reports consolidation screen
Queue consolidation run.
Polling status updates.
Ensure no action export error in browser console.
Files:
consolidation-client.tsx
consolidation-actions.ts
Subject enrollment elective flow
Load groups, unassigned/enrolled lists, enroll/unenroll actions.
Files:
enrollment-view.tsx
enrollment-group-card.tsx
Fees transaction flow
Student selection, pending assignments load, partial payment, ledger open, discount dialog.
Files:
student-payment-tab.tsx
student-ledger-dialog.tsx
student-discount-dialog.tsx
Migration safety check
Run migrate status.
Ensure no failed migration entries.


-----

$env:DATABASE_URL="postgresql://neondb_owner:npg_JfIZEPCTs02t@ep-fancy-wildflower-aiil1w7q.c-4.us-east-1.aws.neon.tech/prisma_migrate_shadow_db_ebb63e5f-4ff2-4c05-add2-2a6b007a9da9?sslmode=require&channel_binding=require"
$env:DIRECT_URL="postgresql://neondb_owner:npg_tSp9IyeZviF5@ep-summer-dawn-a1rk1vzb.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
npx prisma migrate deploy