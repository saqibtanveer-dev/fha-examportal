# Admission Test & Scholarship Test — Security & Anti-Abuse Design

> **Date:** February 28, 2026
> **Scope:** Rate limiting, bot prevention, token security, data isolation, anti-cheating, DDoS mitigation

---

## 1. Threat Model

### Attack Surface

The public portal introduces a **completely new attack surface** that the existing dashboard (auth-gated) doesn't have:

| Threat | Vector | Impact | Priority |
|--------|--------|--------|----------|
| Registration spam | Bot mass-registration | DB bloat, email cost | P0 |
| OTP brute force | Enumerate all 6-digit combos | Account takeover | P0 |
| Test content scraping | Access questions without taking test | Question leak | P0 |
| Answer injection | Submit answers after time expires | Unfair advantage | P0 |
| Token stealing | Intercept access tokens | Impersonation | P0 |
| DDoS on public endpoints | Flood /api/public/* | Service unavail | P1 |
| Email enumeration | Check if email is registered | Privacy leak | P1 |
| Session hijacking | Steal active test session | Impersonation | P1 |
| Data harvesting | Scrape applicant info | Data breach | P1 |
| IP spoofing | Bypass rate limits | Multi-attack | P2 |
| Parameter tampering | Modify marks/answers in transit | Data integrity | P2 |

---

## 2. Rate Limiting Strategy

### Layer 1: Edge/Middleware Rate Limiting

```typescript
// src/middleware.ts — extend existing middleware

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_API_PATHS = ['/api/public/', '/apply/', '/results/', '/track/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply stricter headers for public portal
  if (PUBLIC_API_PATHS.some(p => pathname.startsWith(p))) {
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Rate limit header
    response.headers.set('X-RateLimit-Policy', 'public-portal');
    
    return response;
  }
  
  // Existing auth middleware for dashboard routes...
}
```

### Layer 2: Application-Level Rate Limiting

```typescript
// src/lib/rate-limit.ts — enhance existing implementation

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limiters for different endpoints
const limiters = {
  // Registration: 5 per IP per hour
  register: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1h'),
    prefix: 'rl:register',
  }),
  
  // OTP verification: 5 per applicant per 15 min
  otpVerify: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15m'),
    prefix: 'rl:otp-verify',
  }),
  
  // OTP resend: 3 per applicant per hour
  otpResend: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1h'),
    prefix: 'rl:otp-resend',
  }),
  
  // Test start: 3 per applicant per day (handles accidental refreshes)
  testStart: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '24h'),
    prefix: 'rl:test-start',
  }),
  
  // Answer submit: 120 per session per hour (generous, 1 per 30s)
  answerSubmit: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(120, '1h'),
    prefix: 'rl:answer-submit',
  }),
  
  // Result check: 20 per IP per hour
  resultCheck: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1h'),
    prefix: 'rl:result-check',
  }),
  
  // General API: 100 per IP per minute
  generalPublicApi: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1m'),
    prefix: 'rl:public-api',
  }),
};

export async function checkRateLimit(
  limiterName: keyof typeof limiters,
  identifier: string
): Promise<{ limited: boolean; remaining: number; resetAt: Date }> {
  const limiter = limiters[limiterName];
  const result = await limiter.limit(identifier);
  
  return {
    limited: !result.success,
    remaining: result.remaining,
    resetAt: new Date(result.reset),
  };
}
```

### Rate Limit per Endpoint

| Endpoint | Limit | Identifier | Window |
|----------|-------|-----------|--------|
| POST /register | 5 | IP | 1 hour |
| POST /verify-otp | 5 | applicantId | 15 min |
| POST /resend-otp | 3 | applicantId | 1 hour |
| POST /start-test | 3 | applicantId | 24 hours |
| POST /submit-answer | 120 | sessionId | 1 hour |
| POST /submit-test | 3 | sessionId | 24 hours |
| POST /check-result | 20 | IP | 1 hour |
| GET /api/public/* | 100 | IP | 1 min |

---

## 3. Bot Prevention — CAPTCHA

### Strategy

Use **Cloudflare Turnstile** (free, privacy-respecting) on:
- Registration form (mandatory)
- Result check form (mandatory)
- OTP resend (optional, degrade gracefully)

```typescript
// src/lib/captcha.ts

const TURNSTILE_SECRET = process.env.CF_TURNSTILE_SECRET!;
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: token,
      ...(ip ? { remoteip: ip } : {}),
    }),
  });
  
  const data = await response.json();
  return data.success === true;
}

// Usage in registration action:
export async function registerApplicantAction(data: RegistrationInput) {
  // 1. Verify CAPTCHA first
  if (!data.captchaToken) {
    return { success: false, error: 'Please complete the CAPTCHA' };
  }
  
  const captchaValid = await verifyCaptcha(data.captchaToken);
  if (!captchaValid) {
    return { success: false, error: 'CAPTCHA verification failed' };
  }
  
  // 2. Then rate limit
  // 3. Then process registration
}
```

### Frontend Integration

```tsx
// Turnstile component wrapper
import { Turnstile } from '@marsidev/react-turnstile';

function RegistrationForm() {
  const [captchaToken, setCaptchaToken] = useState<string>('');
  
  return (
    <form>
      {/* Form fields */}
      
      <Turnstile
        siteKey={process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setCaptchaToken(token)}
        options={{ theme: 'light', size: 'normal' }}
      />
      
      <button type="submit" disabled={!captchaToken}>
        Register
      </button>
    </form>
  );
}
```

---

## 4. Token Security

### Access Token Design

```typescript
// Token generation
import { randomBytes, createHash } from 'crypto';

export function generateAccessToken(): string {
  // 32 bytes = 64 hex chars — high entropy, collision-resistant
  return randomBytes(32).toString('hex');
}

export function hashToken(token: string): string {
  // Store hashed token in DB, compare hashed values
  return createHash('sha256').update(token).digest('hex');
}

// In registration:
const rawToken = generateAccessToken();
const hashedToken = hashToken(rawToken);

await prisma.applicant.create({
  data: {
    ...applicantData,
    accessToken: hashedToken, // Store HASH only
  },
});

// Return raw token to applicant (shown once, in email + on screen)
return { accessToken: rawToken };

// In verification:
export async function verifyAccessToken(rawToken: string): Promise<Applicant | null> {
  const hashedToken = hashToken(rawToken);
  return prisma.applicant.findFirst({
    where: { accessToken: hashedToken },
  });
}
```

### OTP Security

```typescript
export function generateOTP(): string {
  // Cryptographically random 6-digit OTP
  const buffer = randomBytes(4);
  const num = buffer.readUInt32BE(0);
  return String(num % 1000000).padStart(6, '0');
}

// OTP rules:
// - 6 digits only
// - Expires in 10 minutes
// - Max 5 attempts per 15 minutes (rate limited)
// - Cleared from DB after verification
// - New OTP invalidates old OTP
// - Resend generates new OTP (old one invalid)
```

### Token Transmission Rules

| Token | Stored In | Transmitted Via | Expiry |
|-------|-----------|----------------|--------|
| Access Token | DB (hashed) | URL param (one-time link), cookie (httpOnly) | Campaign end date |
| OTP | DB (plaintext, temporary) | Email | 10 minutes |
| Test Session Token | DB + httpOnly cookie | Cookie | Test duration |

---

## 5. Anti-Cheating Measures (Test Taking)

### Server-Side Enforcement

```typescript
// Strict time enforcement — no client-side timer trust

async function validateAnswerSubmission(
  sessionId: string,
  questionId: string
): Promise<{ valid: boolean; error?: string }> {
  const session = await prisma.applicantTestSession.findUnique({
    where: { id: sessionId },
    include: { campaign: true },
  });
  
  // 1. Session must exist and be active
  if (!session || session.status !== 'IN_PROGRESS') {
    return { valid: false, error: 'Session not active' };
  }
  
  // 2. Server-side time check (use DB timestamps, not client)
  const startTime = session.startedAt!.getTime();
  const durationMs = session.campaign.durationMinutes * 60 * 1000;
  const deadline = startTime + durationMs + (30 * 1000); // 30s grace period
  
  if (Date.now() > deadline) {
    // Auto-submit and close session
    await autoSubmitSession(sessionId);
    return { valid: false, error: 'Time expired' };
  }
  
  // 3. Validate question belongs to this campaign
  const questionValid = await prisma.campaignQuestion.findFirst({
    where: { campaignId: session.campaignId, questionId },
  });
  
  if (!questionValid) {
    // Flag for suspicious activity
    await flagSession(sessionId, 'INVALID_QUESTION_ID');
    return { valid: false, error: 'Invalid question' };
  }
  
  return { valid: true };
}

// Auto-submit expired sessions (cron job)
async function autoSubmitExpiredSessions() {
  const expiredSessions = await prisma.applicantTestSession.findMany({
    where: {
      status: 'IN_PROGRESS',
      startedAt: {
        lt: new Date(Date.now() - 5 * 60 * 60 * 1000), // Started > 5h ago
      }
    }
  });
  
  for (const session of expiredSessions) {
    await autoSubmitSession(session.id);
  }
}
```

### Suspicious Activity Detection

```typescript
interface SuspicionSignal {
  type: 'TAB_SWITCH' | 'COPY_PASTE' | 'RAPID_ANSWERS' | 'UNUSUAL_TIME_PATTERN' | 'IP_CHANGE';
  timestamp: Date;
  details: Record<string, unknown>;
}

// Track and flag suspicious behavior
async function trackSuspicion(
  sessionId: string,
  signal: SuspicionSignal
) {
  await prisma.applicantTestSession.update({
    where: { id: sessionId },
    data: {
      suspicionLog: {
        push: signal, // Append to JSON array
      },
      // Auto-flag if tab switches exceed threshold
      ...(signal.type === 'TAB_SWITCH' && await shouldAutoFlag(sessionId)
        ? { isFlagged: true, flagReason: 'Excessive tab switches' }
        : {}),
    },
  });
}

// Client reports tab visibility changes
// Server tracks but does NOT immediately disqualify — admin reviews
```

### Question Access Control

```
Questions are NEVER sent all at once to the client.
Instead, use a paginated approach:

1. On test start → return question count + first question
2. Client requests next question → server validates session + time
3. Questions served in server-defined order (shuffled per applicant)
4. Question content never includes correct answer
5. MCQ option order shuffled per applicant
```

Actually, for simplicity and offline resilience, we'll send all questions at once but:
- Strip correct answers from the response
- Shuffle question order per applicant
- Shuffle MCQ option order per applicant
- Log client-side time per question

---

## 6. Data Isolation & Privacy

### Applicant Data Isolation

```
CRITICAL: Applicant data is completely separate from Student/User data.

- Applicant table has NO foreign key to User table
- Applicant email ≠ User email (until enrollment)
- Applicant test sessions ≠ ExamSession
- Applicant answers ≠ StudentAnswer
- Applicant results ≠ ExamResult

Data flows ONE WAY: Applicant → User (at enrollment time only)
```

### Personal Data Handling

```typescript
// Redact PII in logs
function sanitizeForLog(data: Record<string, unknown>): Record<string, unknown> {
  const sensitive = ['email', 'phone', 'cnicOrBForm', 'guardianPhone', 'guardianEmail', 'accessToken', 'otpCode'];
  const sanitized = { ...data };
  
  for (const key of sensitive) {
    if (key in sanitized) {
      sanitized[key] = '***REDACTED***';
    }
  }
  
  return sanitized;
}

// Data retention
// - Failed/rejected applicant data: retain for 1 academic year, then anonymize
// - Enrolled applicant data: retain indefinitely (linked to student record)
// - OTP codes: delete immediately after verification
// - Access tokens: invalidate after campaign ends
```

### Row-Level Security Principles

Even without Postgres RLS, enforce in application:

```typescript
// Every query that touches applicant data MUST include campaignId filter
// This prevents cross-campaign data leakage

// BAD:
const applicant = await prisma.applicant.findUnique({
  where: { id: applicantId },
});

// GOOD:
const applicant = await prisma.applicant.findFirst({
  where: { id: applicantId, campaignId: campaignId },
});
```

---

## 7. Input Validation & Sanitization

### Server-Side Validation (defense in depth)

```typescript
// Every input goes through Zod validation FIRST
// Then additional business logic validation

export async function registerApplicantAction(rawData: unknown) {
  // Layer 1: Zod schema validation (type safety + format)
  const parsed = applicantRegistrationSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  
  // Layer 2: Sanitize strings (trim, escape)
  const data = {
    ...parsed.data,
    firstName: sanitizeString(parsed.data.firstName),
    lastName: sanitizeString(parsed.data.lastName),
    guardianName: sanitizeString(parsed.data.guardianName),
    address: parsed.data.address ? sanitizeString(parsed.data.address) : undefined,
  };
  
  // Layer 3: Business validation (campaign status, duplicates, etc.)
  // ...
}

function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Strip angle brackets (basic XSS prevention)
    .slice(0, 500);       // Hard length limit
}
```

### SQL Injection Prevention

Prisma ORM handles parameterized queries. No raw SQL allowed in admission module.

```typescript
// NEVER do this
// prisma.$queryRaw`SELECT * FROM "Applicant" WHERE email = ${email}`

// ALWAYS use Prisma Client methods
const applicant = await prisma.applicant.findFirst({
  where: { email: data.email },
});
```

---

## 8. CORS & CSP Configuration

### For Public Portal Routes

```typescript
// next.config.ts — CSP headers

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com", // Turnstile iframe
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; '),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
];

// Apply to public routes in next.config.ts headers()
```

---

## 9. Monitoring & Alerting

### Security Events to Monitor

```typescript
// Log these events for security monitoring:

const SECURITY_EVENTS = {
  REGISTRATION_RATE_LIMIT_HIT: 'alert', // Possible bot attack
  OTP_BRUTE_FORCE_DETECTED: 'alert',    // >5 failed OTP attempts
  SUSPICIOUS_SESSION_FLAGGED: 'warn',    // Tab switches, etc.
  TOKEN_REUSE_ATTEMPT: 'alert',          // Same token used from different IP
  MASS_REGISTRATION_DETECTED: 'alert',   // >20 registrations per minute
  INVALID_QUESTION_ACCESS: 'alert',      // Trying to access questions from other campaigns
  TIME_VIOLATION: 'warn',                // Answer submitted after time expired
  BULK_RESULT_CHECK: 'warn',             // >50 result checks from same IP
};

async function logSecurityEvent(
  event: keyof typeof SECURITY_EVENTS,
  details: Record<string, unknown>
) {
  const level = SECURITY_EVENTS[event];
  
  // Log to audit table
  await prisma.auditLog.create({
    data: {
      action: `SECURITY:${event}`,
      details: JSON.stringify(sanitizeForLog(details)),
    },
  });
  
  // If alert level, notify admin
  if (level === 'alert') {
    await createNotification({
      userId: 'ADMIN_SYSTEM',
      title: `Security Alert: ${event}`,
      message: `Suspicious activity detected. Check audit logs.`,
      type: 'SYSTEM',
    });
  }
}
```

---

## 10. Security Checklist

### Pre-Launch Checklist

- [ ] All public endpoints have rate limiting
- [ ] CAPTCHA on registration and result check forms
- [ ] Access tokens are hashed in DB
- [ ] OTPs expire after 10 minutes
- [ ] Test time is enforced server-side
- [ ] Questions don't include correct answers in API response
- [ ] No cross-campaign data leakage possible
- [ ] CSP headers configured for public routes
- [ ] All inputs validated with Zod before processing
- [ ] PII redacted from all logs
- [ ] Auto-submit for expired test sessions
- [ ] Suspicious session flagging implemented
- [ ] Email sending has rate limits (no email bomb)
- [ ] No direct database IDs exposed in public URLs (use tokens)
- [ ] HTTPS enforced (HSTS header)
- [ ] Admin actions require auth + role check
- [ ] Audit trail for all admin decisions
