import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

type Props = { applicationNumber: string };

export function TestSubmittedView({ applicationNumber }: Props) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
          <CardTitle>Test Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your test has been submitted successfully.
          </p>
          {applicationNumber && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Application Number</p>
              <p className="text-lg font-bold">{applicationNumber}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/results')}
            >
              Check Results
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/track')}
            >
              Track Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
