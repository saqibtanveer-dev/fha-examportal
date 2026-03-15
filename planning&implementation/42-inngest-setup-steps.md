# Trigger.dev Setup - Aap ke karne wale simple steps

Last Updated: 2026-03-15

## 1) Trigger.dev account and project create karo
- Trigger.dev dashboard me login karo.
- Ek app/project create karo.

## 2) Vercel env vars set karo
Vercel project settings me ye env vars add karo:
- `TRIGGER_SECRET_KEY`
- `TRIGGER_PROJECT_REF`

Note:
- Ye values Trigger.dev dashboard/project settings se milti hain.
- `TRIGGER_SECRET_KEY` se app `tasks.trigger(...)` calls authorize karega.
- `TRIGGER_PROJECT_REF` deployment/linking ke liye required hota hai.

## 3) Trigger config verify karo
- Root me `trigger.config.ts` present hona chahiye.
- `dirs` me workflow/task folder included hona chahiye (abhi reports workflow mapped hai).

## 4) Local testing (recommended)
- App run: `pnpm dev`
- Trigger.dev dev worker run (new terminal):
  - `npx trigger.dev@latest dev`
- Consolidation run karke Trigger.dev dashboard/dev logs me run verify karo.

## 5) Smoke test checklist
- Consolidation start karne pe UI me queued message aaye.
- Result term `isComputing=true` ho jaye.
- Workflow complete hone pe `isComputing=false` ho jaye.
- Success/failure audit logs create hon.

## 6) Rollback-safe note
Agar Trigger.dev keys missing hon to consolidation queue fail hogi but existing app modules unaffected rahenge.

## 7) Next hardening tasks (pending)
- Job table for queue visibility.
- Progress polling UI.
- Stale lock lease/recovery.
