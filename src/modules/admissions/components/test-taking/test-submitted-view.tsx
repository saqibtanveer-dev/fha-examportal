import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

type Props = { applicationNumber: string };

export function TestSubmittedView({ applicationNumber }: Props) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CheckCircle className="mx-auto mb-2 h-12 w-12 text-green-500" />
          <CardTitle>Test Submitted!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Your test has been submitted successfully. You may now close this window.
          </p>
          {applicationNumber && (
            <div className="rounded-md border bg-muted/50 p-3">
              <p className="text-xs text-muted-foreground">Application Number</p>
              <p className="text-lg font-bold">{applicationNumber}</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Your results will be shared by the school administration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
