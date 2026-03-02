'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, ArrowRight, AlertCircle } from 'lucide-react';
import { TestTakingInterface } from '@/modules/admissions/components/test-taking-interface';

export function TestPinEntryPage() {
  const [pin, setPin] = useState('');
  const [submittedPin, setSubmittedPin] = useState<string | null>(null);

  function handleStartTest(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pin.trim();
    if (!trimmed) return;
    setSubmittedPin(trimmed);
  }

  // Once PIN is submitted, show the test interface
  if (submittedPin) {
    return (
      <TestTakingInterface
        accessToken={submittedPin}
        campaignName="Admission Test"
        onAuthError={() => setSubmittedPin(null)}
      />
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-7 w-7 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enter Test PIN</CardTitle>
          <CardDescription>
            Enter the PIN provided by your school to start the test.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStartTest} className="space-y-4">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              placeholder="Enter your PIN (e.g. 847291)"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[0.3em] font-mono h-14"
              autoFocus
              autoComplete="off"
            />
            <Button
              type="submit"
              className="w-full h-12 text-base"
              disabled={pin.trim().length < 4}
            >
              Start Test
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                <p className="font-medium">Before you begin:</p>
                <ul className="list-disc pl-3 space-y-0.5">
                  <li>The test will enter fullscreen mode</li>
                  <li>Do not switch tabs or exit fullscreen</li>
                  <li>Your answers are auto-saved periodically</li>
                  <li>You cannot re-enter once you submit</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
