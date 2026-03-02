'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/shared';
import { checkResultAction } from '@/modules/admissions/portal-actions';
import { Search, Trophy, Award, CheckCircle, XCircle, Clock, Medal } from 'lucide-react';

type ResultData = {
  name: string;
  applicationNumber: string;
  campaignName: string;
  campaignType: string;
  status: string;
  result: {
    totalMarks: number;
    obtainedMarks: number;
    percentage: number;
    grade: string | null;
    isPassed: boolean;
    rank: number | null;
  };
  scholarship: {
    tier: string;
    percentageAwarded: number;
    status: string;
  } | null;
  decision: {
    decision: string;
    remarks: string | null;
    conditions: string | null;
  } | null;
};

export default function ResultsPage() {
  const [applicationNumber, setApplicationNumber] = useState('');
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<ResultData | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCheck() {
    startTransition(async () => {
      const res = await checkResultAction({ applicationNumber, email });
      if (res.success && res.data) {
        setResult(res.data as ResultData);
      } else {
        toast.error(res.error ?? 'Result not found');
        setResult(null);
      }
    });
  }

  const tierLabels: Record<string, string> = {
    FULL_100: '100% Scholarship',
    SEVENTY_FIVE: '75% Scholarship',
    HALF_50: '50% Scholarship',
    QUARTER_25: '25% Scholarship',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <Trophy className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Check Your Results</h1>
        <p className="mt-2 text-muted-foreground">
          Enter your application number and registered email
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={(e) => { e.preventDefault(); handleCheck(); }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Application Number</Label>
                <Input
                  required
                  placeholder="ADM-2026-0001"
                  value={applicationNumber}
                  onChange={(e) => setApplicationNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  required
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Spinner size="sm" className="mr-2" /> : <Search className="mr-2 h-4 w-4" />}
              Check Result
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>{result.name}</CardTitle>
                <CardDescription>{result.campaignName}</CardDescription>
              </div>
              <Badge
                variant="outline"
                className={result.result.isPassed ? 'border-green-300 bg-green-50 text-green-700' : 'border-red-300 bg-red-50 text-red-700'}
              >
                {result.result.isPassed ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                {result.result.isPassed ? 'Passed' : 'Not Passed'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Card */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-2xl font-bold">
                  {result.result.obtainedMarks}/{result.result.totalMarks}
                </p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">Percentage</p>
                <p className="text-2xl font-bold">{Number(result.result.percentage).toFixed(1)}%</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">Rank</p>
                <p className="text-2xl font-bold">
                  {result.result.rank ? `#${result.result.rank}` : '—'}
                </p>
              </div>
            </div>

            {result.result.grade && (
              <div className="text-center">
                <Badge variant="outline" className="text-lg px-4 py-1">
                  Grade: {result.result.grade}
                </Badge>
              </div>
            )}

            {/* Decision */}
            {result.decision && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Award className="h-4 w-4" />Admission Decision
                  </h3>
                  <Badge
                    className={
                      result.decision.decision === 'ACCEPTED'
                        ? 'bg-green-100 text-green-700'
                        : result.decision.decision === 'REJECTED'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }
                  >
                    {result.decision.decision}
                  </Badge>
                  {result.decision.conditions && (
                    <p className="text-sm text-muted-foreground">
                      Conditions: {result.decision.conditions}
                    </p>
                  )}
                  {result.decision.remarks && (
                    <p className="text-sm text-muted-foreground">{result.decision.remarks}</p>
                  )}
                </div>
              </>
            )}

            {/* Scholarship */}
            {result.scholarship && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Medal className="h-4 w-4 text-yellow-500" />Scholarship
                  </h3>
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="font-medium text-yellow-800">
                      {tierLabels[result.scholarship.tier] ?? result.scholarship.tier}
                    </p>
                    <p className="text-sm text-yellow-700">
                      {result.scholarship.percentageAwarded}% fee waiver
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {result.scholarship.status}
                    </Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
