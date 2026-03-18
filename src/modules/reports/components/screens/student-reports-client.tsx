'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Printer, FileText, GraduationCap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared';
import { DmcPrintTemplate } from '@/modules/reports/components/print/dmc-print-template';
import { getStudentDmcAction } from '@/modules/reports/actions/result-term-fetch-actions';
import type { DmcData } from '@/modules/reports/types/report-types';
import { format } from 'date-fns';

type Term = {
  id: string;
  name: string;
  publishedAt: Date | null;
  academicSession: { name: string };
};

type Props = { studentId: string; terms: Term[] };

export function StudentReportsClient({ studentId, terms }: Props) {
  const [isPending, startTransition] = useTransition();
  const [selectedTermId, setSelectedTermId] = useState('');
  const [dmcData, setDmcData] = useState<DmcData | null>(null);

  function handleView(termId: string) {
    setSelectedTermId(termId);
    setDmcData(null);
    startTransition(async () => {
      try {
        const data = await getStudentDmcAction(termId, studentId);
        if (!data) { toast.error('DMC not available'); return; }
        setDmcData(data);
      } catch {
        toast.error('Failed to load DMC. Please try again.');
      }
    });
  }

  if (terms.length === 0) {
    return (
      <EmptyState
        icon={<GraduationCap className="h-12 w-12 text-muted-foreground" />}
        title="No results published"
        description="Your results will appear here once your school publishes them"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Term Cards */}
      <div className="no-print grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {terms.map((term) => (
          <Card
            key={term.id}
            className={`cursor-pointer transition-all hover:border-primary ${selectedTermId === term.id ? 'border-primary ring-1 ring-primary' : ''}`}
            onClick={() => handleView(term.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{term.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>{term.academicSession.name}</p>
              {term.publishedAt && (
                <Badge variant="secondary">
                  Published {format(term.publishedAt, 'dd MMM yyyy')}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* DMC Preview */}
      {isPending && (
        <div className="flex items-center justify-center py-10 sm:py-12 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading your DMC...
        </div>
      )}

      {!isPending && !dmcData && selectedTermId && (
        <EmptyState
          icon={<FileText className="h-12 w-12 text-muted-foreground" />}
          title="DMC not available"
          description="Results data could not be loaded"
        />
      )}

      {dmcData && !isPending && (
        <>
          <div className="no-print flex justify-end">
            <Button onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Print DMC
            </Button>
          </div>
          <DmcPrintTemplate dmc={dmcData} />
        </>
      )}
    </div>
  );
}
