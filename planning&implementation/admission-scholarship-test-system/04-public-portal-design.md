# Admission Test & Scholarship Test — Public Portal Design

> **Date:** February 28, 2026
> **Scope:** All public-facing pages, self-registration, test-taking, result-checking for external applicants

---

## 1. Route Structure

```
(public)/
├── admission/
│   ├── page.tsx                              → Campaign listing (all open campaigns)
│   ├── [slug]/
│   │   ├── page.tsx                          → Campaign detail + "Apply Now"
│   │   ├── register/
│   │   │   └── page.tsx                      → Multi-step registration form
│   │   ├── verify/
│   │   │   └── page.tsx                      → OTP verification
│   │   ├── test/
│   │   │   └── page.tsx                      → Test-taking interface (token-based auth)
│   │   ├── submitted/
│   │   │   └── page.tsx                      → Post-submission confirmation
│   │   └── result/
│   │       └── page.tsx                      → Result checking (app# + email)
│   └── track/
│       └── page.tsx                          → Application status tracker
```

### Auth Strategy for Public Portal

- **NO NextAuth session required** — these are public pages
- **Token-based access** for test-taking: `?token=<accessToken>`
- **Application number + email** for result checking (form-based verification)
- **Rate limiting** on all public endpoints:
  - Registration: 3 per IP per hour
  - OTP verification: 5 attempts per applicant, then lockout 15min
  - Test access: token-based, single-use session
  - Result check: 10 per IP per minute

### Middleware Integration

```typescript
// In middleware.ts — add public admission routes to bypass list:
const PUBLIC_ROUTES = [
  '/login',
  '/forgot-password',
  '/reset-password',
  '/admission',              // NEW: all admission portal routes
  '/api/admission',          // NEW: admission API routes
];

// These routes do NOT require authentication
// They have their own token-based auth for test-taking
```

---

## 2. Campaign Listing Page (`/admission`)

```
┌─────────────────────────────────────────────────────────────┐
│                  🏫 School Name — Admissions                 │
│                  "Shaping tomorrow's leaders"                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 🔍 Search campaigns...                               │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Open Campaigns                                              │
│                                                              │
│  ┌──────────────────────────────┐ ┌─────────────────────┐   │
│  │ 📋 Class 6 Admission 2026-27 │ │ 📋 Class 9 Admission│   │
│  │                               │ │    2026-27          │   │
│  │ Type: Admission + Scholarship │ │ Type: Admission     │   │
│  │ Target: Class 6               │ │ Target: Class 9     │   │
│  │ Seats: 120                    │ │ Seats: 80           │   │
│  │                               │ │                     │   │
│  │ Registration: Mar 1-15        │ │ Registration: Mar 1-│   │
│  │ Test Date: Mar 20, 2026       │ │ 15                  │   │
│  │ Duration: 90 minutes          │ │ Test Date: Mar 22   │   │
│  │                               │ │ Duration: 120 min   │   │
│  │ 🏆 Scholarship Available      │ │                     │   │
│  │                               │ │                     │   │
│  │ [Apply Now →]                 │ │ [Apply Now →]       │   │
│  └──────────────────────────────┘ └─────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  Already applied?                                            │
│  [Track Your Application →] [Check Results →]                │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Footer: School address, contact, phone                      │
└─────────────────────────────────────────────────────────────┘
```

### Server Component Data Fetching

```typescript
// /admission/page.tsx — Server Component
async function AdmissionPortalPage() {
  const campaigns = await getCampaignsForPublicPortal();
  // Only returns: REGISTRATION_OPEN or TEST_ACTIVE campaigns
  // Plus recently RESULTS_PUBLISHED campaigns (for result checking)
  
  return <AdmissionPortalView campaigns={campaigns} />;
}
```

---

## 3. Campaign Detail Page (`/admission/[slug]`)

```
┌─────────────────────────────────────────────────────────────┐
│ ← Back to Admissions                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📋 Class 6 Admission Test 2026-27                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                         │
│                                                              │
│  Type: Admission + Scholarship                               │
│  Target Class: Class 6                                       │
│  Available Seats: 120                                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📅 Important Dates                                     │  │
│  │ ├── Registration Opens: March 1, 2026                  │  │
│  │ ├── Registration Closes: March 15, 2026                │  │
│  │ ├── Test Date: March 20, 2026 (10:00 AM - 12:00 PM)   │  │
│  │ └── Results: March 25, 2026                            │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📝 Test Details                                        │  │
│  │ ├── Duration: 90 minutes                               │  │
│  │ ├── Total Questions: 38                                │  │
│  │ ├── Total Marks: 100                                   │  │
│  │ ├── Passing Marks: 40                                  │  │
│  │ ├── Sections:                                          │  │
│  │ │   ├── Section A: MCQ (30 questions, 60 marks)        │  │
│  │ │   └── Section B: Short Answer (8 questions, 40 marks)│  │
│  │ └── Negative Marking: -0.25 per wrong MCQ answer       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🏆 Scholarship Tiers                                   │  │
│  │ ├── 100% Scholarship: Score ≥ 90%   (up to 5 seats)   │  │
│  │ ├── 75% Scholarship:  Score ≥ 80%   (up to 10 seats)  │  │
│  │ ├── 50% Scholarship:  Score ≥ 70%   (up to 20 seats)  │  │
│  │ └── 25% Scholarship:  Score ≥ 60%   (up to 30 seats)  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✅ Eligibility                                         │  │
│  │ ├── Age: 10-13 years                                   │  │
│  │ ├── Previous Class: Class 5 completed                  │  │
│  │ └── Required: Birth certificate, last report card      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Status: 🟢 Registration Open (12 days remaining)            │
│  Applied so far: 156 applicants                              │
│                                                              │
│           [Apply Now →]                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Registration Form (`/admission/[slug]/register`)

### Multi-Step Form with React Hook Form

```typescript
// Form schema (Zod):
const applicantRegistrationSchema = z.object({
  // Step 1: Personal Info
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  dateOfBirth: z.date().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  
  // Step 2: Guardian Info
  guardianName: z.string().min(2).max(100).optional(),
  guardianPhone: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  
  // Step 3: Academic Background
  previousSchool: z.string().optional(),
  previousClass: z.string().optional(),
  previousGrade: z.string().optional(),
  
  // Step 4: Address
  address: z.string().optional(),
  city: z.string().optional(),
  
  // CAPTCHA
  captchaToken: z.string(),
});
```

### Form UI

```
┌─────────────────────────────────────────────────────────────┐
│ Apply: Class 6 Admission Test 2026-27              Step 1/4 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ━━━●━━━━━━○━━━━━━○━━━━━━○━━                                │
│  Personal   Guardian  Academic  Review                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Personal Information                                   │  │
│  │                                                        │  │
│  │ First Name*     [________________]                     │  │
│  │ Last Name*      [________________]                     │  │
│  │ Email*          [________________]                     │  │
│  │ Phone           [________________]                     │  │
│  │ Date of Birth   [__/__/____]                          │  │
│  │ Gender          ○ Male  ○ Female  ○ Other              │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│                                           [Next Step →]      │
└─────────────────────────────────────────────────────────────┘
```

### Registration Flow (Server Action)

```typescript
async function registerApplicantAction(data: ApplicantRegistrationInput) {
  // 1. Validate CAPTCHA (Google reCAPTCHA v3 or Turnstile)
  await verifyCaptcha(data.captchaToken);
  
  // 2. Rate limit: 3 registrations per IP per hour
  await checkRateLimit(`register:${getClientIp()}`, 3, '1h');
  
  // 3. Validate campaign exists and registration is open
  const campaign = await getCampaignBySlug(slug);
  if (campaign.status !== 'REGISTRATION_OPEN') {
    throw new ConflictError('Registration is closed');
  }
  
  // 4. Check email uniqueness within campaign
  const existing = await findApplicantByCampaignAndEmail(campaign.id, data.email);
  if (existing) {
    throw new ConflictError('You have already applied for this campaign');
  }
  
  // 5. Validate eligibility criteria (age, etc.)
  if (campaign.eligibilityCriteria) {
    validateEligibility(data, campaign.eligibilityCriteria);
  }
  
  // 6. Generate application number
  const applicationNumber = await generateApplicationNumber(campaign); // "ADM-2026-0342"
  
  // 7. Generate access token + OTP
  const accessToken = crypto.randomUUID();
  const emailOtp = generateOTP(6); // 6-digit
  
  // 8. Create applicant
  const applicant = await prisma.applicant.create({
    data: {
      campaignId: campaign.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      previousSchool: data.previousSchool,
      previousClass: data.previousClass,
      previousGrade: data.previousGrade,
      address: data.address,
      city: data.city,
      applicationNumber,
      accessToken,
      accessTokenExpiresAt: new Date(campaign.testEndAt.getTime() + 24 * 60 * 60 * 1000),
      emailOtp: await hashOtp(emailOtp),
      otpExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 min
      ipAddress: getClientIp(),
      userAgent: getUserAgent(),
    }
  });
  
  // 9. Send OTP email
  await sendEmail({
    to: data.email,
    subject: `Verify your application - ${campaign.name}`,
    template: 'admission-otp',
    data: {
      name: data.firstName,
      applicationNumber,
      otp: emailOtp,
      campaignName: campaign.name,
    }
  });
  
  // 10. Audit log
  await createPublicAuditLog('APPLICANT_REGISTERED', 'Applicant', applicant.id, {
    campaignId: campaign.id,
    email: data.email,
  });
  
  return { applicationNumber, email: data.email };
}
```

---

## 5. OTP Verification (`/admission/[slug]/verify`)

```
┌─────────────────────────────────────────────────────────────┐
│ Verify Your Email                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application #: ADM-2026-0342                                │
│  Email: a****@gmail.com                                      │
│                                                              │
│  We've sent a 6-digit verification code to your email.       │
│                                                              │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                            │
│  │  │ │  │ │  │ │  │ │  │ │  │   Enter OTP                 │
│  └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                            │
│                                                              │
│  [Verify →]                                                  │
│                                                              │
│  Didn't receive?  [Resend OTP] (available in 60s)            │
│  Attempts remaining: 3                                       │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### OTP Verification Logic

```typescript
async function verifyApplicantOtpAction(
  slug: string, 
  email: string, 
  otp: string
) {
  // 1. Rate limit: 5 attempts per email per 15 min
  await checkRateLimit(`otp:${email}`, 5, '15m');
  
  // 2. Find applicant
  const applicant = await findApplicantByEmail(campaignSlug, email);
  if (!applicant) throw new NotFoundError('Application not found');
  
  // 3. Check OTP not expired
  if (applicant.otpExpiresAt < new Date()) {
    throw new ValidationError('OTP has expired. Please request a new one.');
  }
  
  // 4. Check attempts
  if (applicant.otpAttempts >= 5) {
    throw new RateLimitError('Too many attempts. Please request a new OTP.');
  }
  
  // 5. Verify OTP
  const isValid = await verifyOtpHash(otp, applicant.emailOtp);
  if (!isValid) {
    await prisma.applicant.update({
      where: { id: applicant.id },
      data: { otpAttempts: { increment: 1 } }
    });
    throw new ValidationError('Invalid OTP. Please try again.');
  }
  
  // 6. Mark verified
  await prisma.applicant.update({
    where: { id: applicant.id },
    data: {
      status: 'VERIFIED',
      isEmailVerified: true,
      emailOtp: null,
      otpAttempts: 0,
    }
  });
  
  // 7. Send confirmation email with test access link
  await sendEmail({
    to: applicant.email,
    subject: `Application Confirmed - ${campaign.name}`,
    template: 'admission-confirmed',
    data: {
      name: applicant.firstName,
      applicationNumber: applicant.applicationNumber,
      testDate: campaign.testStartAt,
      testDuration: campaign.testDuration,
      accessLink: `${BASE_URL}/admission/${slug}/test?token=${applicant.accessToken}`,
    }
  });
  
  return { success: true, message: 'Email verified! Check your email for test access link.' };
}
```

---

## 6. Test-Taking Interface (`/admission/[slug]/test?token=...`)

### Token-Based Authentication

```typescript
// This page does NOT use NextAuth — it uses URL token
async function AdmissionTestPage({ params, searchParams }) {
  const { slug } = params;
  const { token } = searchParams;
  
  // 1. Validate token
  const applicant = await validateApplicantToken(token);
  // Checks: token exists, not expired, status = VERIFIED or TEST_IN_PROGRESS
  
  // 2. Validate campaign test window
  const campaign = await getCampaignBySlug(slug);
  if (campaign.status !== 'TEST_ACTIVE') {
    return <TestNotAvailable reason="Test window is not active" />;
  }
  
  // 3. Get or create test session
  let session = await getOrCreateApplicantTestSession(applicant.id, campaign.id);
  
  // 4. Load questions (with shuffled order)
  const questions = await getTestQuestionsForApplicant(session);
  
  // 5. Render test interface (client component)
  return (
    <ApplicantTestView
      applicant={applicant}
      campaign={campaign}
      session={session}
      questions={questions}
    />
  );
}
```

### Test-Taking Component (Reuse from Internal Exams)

The test-taking UI reuses ~80% of the existing `ExamTakingView` component:

```typescript
// Shared components:
// - QuestionNavigator (sidebar with question status)
// - QuestionRenderer (displays question + answer options)
// - ExamTimer (countdown timer with warnings)
// - ReviewScreen (summary before submit)
// - AntiCheatMonitor (tab switch, fullscreen, copy detection)

// New/modified components:
// - ApplicantTestShell (replaces authenticated exam shell)
// - NegativeMarkingWarning (displays when MCQ has negative marking)
// - SectionSeparator (displays section breaks: "Section A: MCQ", "Section B: Short Answer")
```

---

## 7. Result Checking (`/admission/[slug]/result`)

```
┌─────────────────────────────────────────────────────────────┐
│ Check Your Result                                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Campaign: Class 6 Admission Test 2026-27                    │
│                                                              │
│  Enter your details to view your result:                     │
│                                                              │
│  Application Number*  [ADM-2026-____]                        │
│  Registered Email*    [_____________]                        │
│                                                              │
│  [View Result →]                                             │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│  Results published on: March 25, 2026                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Result Display (After Verification)

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Your Admission Test Result                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application: ADM-2026-0342                                  │
│  Name: Ahmed Khan                                            │
│  Campaign: Class 6 Admission Test 2026-27                    │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │   Score: 78 / 100  (78%)                               │  │
│  │   ████████████████████████████░░░░░░░░                 │  │
│  │                                                        │  │
│  │   Rank: #15 out of 342 applicants                      │  │
│  │   Status: ✅ SHORTLISTED                                │  │
│  │                                                        │  │
│  │   🏆 Scholarship: 50% Scholarship Awarded!             │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Section Breakdown:                                          │
│  ┌─────────────────────┬──────────┬─────────┐              │
│  │ Section              │ Marks    │ %       │              │
│  ├─────────────────────┼──────────┼─────────┤              │
│  │ Section A: MCQ       │ 45/60    │ 75.0%   │              │
│  │ Section B: Short Ans │ 33/40    │ 82.5%   │              │
│  │ TOTAL                │ 78/100   │ 78.0%   │              │
│  └─────────────────────┴──────────┴─────────┘              │
│                                                              │
│  Next Steps:                                                 │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Congratulations on being shortlisted!                  │  │
│  │                                                        │  │
│  │ Please visit the school administration office with:    │  │
│  │ • Original birth certificate                           │  │
│  │ • Previous school report card                          │  │
│  │ • 2 passport-size photographs                          │  │
│  │ • Parent/Guardian CNIC copy                            │  │
│  │                                                        │  │
│  │ Deadline: March 30, 2026                               │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  [Download Result PDF] [Print]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. Application Tracker (`/admission/track`)

```
┌─────────────────────────────────────────────────────────────┐
│ Track Your Application                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Application Number*  [ADM-2026-____]                        │
│  Registered Email*    [_____________]                        │
│                                                              │
│  [Track →]                                                   │
│                                                              │
│  ─────────────────────────────────────────────────────────   │
│                                                              │
│  📋 Application Status                                       │
│                                                              │
│  Application: ADM-2026-0342                                  │
│  Campaign: Class 6 Admission Test 2026-27                    │
│                                                              │
│  Timeline:                                                   │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ✅ Mar 5  — Application Submitted                      │  │
│  │ ✅ Mar 5  — Email Verified                             │  │
│  │ ✅ Mar 20 — Test Completed (78/100)                    │  │
│  │ ✅ Mar 25 — Results Published — SHORTLISTED             │  │
│  │ ✅ Mar 25 — 50% Scholarship Awarded                    │  │
│  │ ⏳ Pending — Document Verification                      │  │
│  │ ○  Pending — Final Admission Decision                   │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Current Status: SHORTLISTED ✅                              │
│  Scholarship: 50% Scholarship                                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Public Portal Branding

### School Branding Integration

```typescript
// The public portal pulls school branding from SchoolSettings:
interface PortalBranding {
  schoolName: string;      // From SchoolSettings
  schoolLogo: string;      // From SchoolSettings
  primaryColor: string;    // From SchoolSettings (new field)
  tagline?: string;        // From SchoolSettings (new field)
  contactEmail: string;    // From SchoolSettings
  contactPhone: string;    // From SchoolSettings
  address: string;         // From SchoolSettings
}
```

### Responsive Design Requirements

- **Mobile-first** — applicants will likely register from phones
- **Minimal JavaScript** — fast load on slow connections
- **Progressive form** — each step validates before next
- **Accessible** — WCAG 2.1 AA compliant
- **Print-friendly** — result page should print cleanly
