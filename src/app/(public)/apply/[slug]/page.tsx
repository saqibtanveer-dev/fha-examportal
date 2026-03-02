'use client';

import { useEffect, useState, useTransition } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/shared';
import { fetchPublicCampaignDetailAction } from '@/modules/admissions/admission-fetch-actions';
import { registerApplicantAction, verifyOtpAction, resendOtpAction } from '@/modules/admissions/portal-actions';
import { GraduationCap, Clock, Trophy, ArrowLeft, Mail, Shield } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

type Campaign = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  testDuration: number;
  totalMarks: number;
  hasScholarship: boolean;
  registrationEndAt: string | null;
  testStartAt: string | null;
};

type Step = 'info' | 'form' | 'otp' | 'success';

export default function CampaignApplyPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>('info');
  const [isPending, startTransition] = useTransition();

  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '' as '' | 'MALE' | 'FEMALE' | 'OTHER',
    guardianName: '',
    guardianPhone: '',
    previousSchool: '',
    previousClass: '',
    address: '',
  });

  // OTP data
  const [applicantId, setApplicantId] = useState('');
  const [otp, setOtp] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [applicationNumber, setApplicationNumber] = useState('');

  useEffect(() => {
    fetchPublicCampaignDetailAction(slug).then((r) => {
      if (r.success && r.data) setCampaign(r.data as Campaign);
      setLoading(false);
    });
  }, [slug]);

  function handleRegister() {
    if (!campaign) return;
    startTransition(async () => {
      const result = await registerApplicantAction({
        campaignId: campaign.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        guardianName: formData.guardianName || undefined,
        guardianPhone: formData.guardianPhone || undefined,
        previousSchool: formData.previousSchool || undefined,
        previousClass: formData.previousClass || undefined,
        address: formData.address || undefined,
      });

      if (result.success && result.data) {
        setApplicantId((result.data as any).applicantId);
        setStep('otp');
        toast.success('Registration successful! Check your email for OTP.');
      } else {
        toast.error(result.error ?? 'Registration failed');
      }
    });
  }

  function handleVerifyOtp() {
    startTransition(async () => {
      const result = await verifyOtpAction({ applicantId, otp });
      if (result.success && result.data) {
        const data = result.data as { accessToken: string; applicationNumber: string };
        setAccessToken(data.accessToken);
        setApplicationNumber(data.applicationNumber);
        setStep('success');
        toast.success('Email verified!');
      } else {
        toast.error(result.error ?? 'Verification failed');
      }
    });
  }

  function handleResendOtp() {
    startTransition(async () => {
      const result = await resendOtpAction({ applicantId });
      if (result.success) toast.success('New OTP sent to your email');
      else toast.error(result.error ?? 'Failed to resend');
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12"><Spinner /></div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <h2 className="text-xl font-bold">Campaign Not Found</h2>
        <p className="mt-2 text-muted-foreground">This campaign doesn't exist or registration is not open.</p>
        <Link href="/apply">
          <Button variant="outline" className="mt-4"><ArrowLeft className="mr-2 h-4 w-4" />Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/apply" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1 h-4 w-4" />Back to campaigns
      </Link>

      {/* Campaign Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{campaign.name}</CardTitle>
              <CardDescription className="mt-1">{campaign.description}</CardDescription>
            </div>
            {campaign.hasScholarship && (
              <Badge variant="outline" className="border-yellow-300 bg-yellow-50 text-yellow-700">
                <Trophy className="mr-1 h-3 w-3" />Scholarship
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{campaign.testDuration} min</span>
            <span>{campaign.totalMarks} marks</span>
            {campaign.registrationEndAt && (
              <span>Deadline: {format(new Date(campaign.registrationEndAt), 'MMM d, yyyy')}</span>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Step: Info */}
      {step === 'info' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <ul className="list-inside list-disc space-y-1 text-muted-foreground">
              <li>Fill in your personal details accurately</li>
              <li>Verify your email address with a one-time password (OTP)</li>
              <li>You will receive a test access link after verification</li>
              <li>Test duration: {campaign.testDuration} minutes</li>
              <li>The test will auto-submit when time runs out</li>
              <li>Do not switch tabs or exit fullscreen during the test</li>
            </ul>
            <Button className="w-full" onClick={() => setStep('form')}>
              Continue to Registration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step: Registration Form */}
      {step === 'form' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registration Form</CardTitle>
            <CardDescription>Fill in your details to apply</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => setFormData({ ...formData, gender: v as 'MALE' | 'FEMALE' | 'OTHER' })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Guardian Name</Label>
                  <Input
                    value={formData.guardianName}
                    onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Guardian Phone</Label>
                  <Input
                    value={formData.guardianPhone}
                    onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Previous School</Label>
                  <Input
                    value={formData.previousSchool}
                    onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Previous Class</Label>
                  <Input
                    value={formData.previousClass}
                    onChange={(e) => setFormData({ ...formData, previousClass: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep('info')}>
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending && <Spinner size="sm" className="mr-2" />}
                  Register & Get OTP
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step: OTP Verification */}
      {step === 'otp' && (
        <Card>
          <CardHeader className="text-center">
            <Mail className="mx-auto mb-2 h-10 w-10 text-primary" />
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="mx-auto max-w-xs space-y-4">
              <div className="space-y-2">
                <Label>Enter OTP</Label>
                <Input
                  className="text-center text-2xl tracking-[0.5em]"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isPending || otp.length !== 6}>
                {isPending && <Spinner size="sm" className="mr-2" />}
                Verify
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={handleResendOtp}
                disabled={isPending}
              >
                Resend OTP
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <Card>
          <CardHeader className="text-center">
            <Shield className="mx-auto mb-2 h-10 w-10 text-green-500" />
            <CardTitle>Registration Complete!</CardTitle>
            <CardDescription>Your application has been submitted successfully</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="rounded-md border bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Application Number</p>
              <p className="text-2xl font-bold tracking-wider">{applicationNumber}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Save your application number. You'll need it to check results and track your application.
            </p>
            <p className="text-sm text-muted-foreground">
              A test access link has been sent to your email. You can start the test when the test window opens.
            </p>
            <div className="flex gap-2">
              <Link href="/track" className="flex-1">
                <Button variant="outline" className="w-full">Track Application</Button>
              </Link>
              <Link href="/apply" className="flex-1">
                <Button variant="outline" className="w-full">Back to Campaigns</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
