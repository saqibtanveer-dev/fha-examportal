'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { Printer, TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/shared';
import { GazettePrintTemplate } from '@/modules/reports/components/print/gazette-print-template';
import {
  getSectionsForClassAction,
  getGazetteDataAction,
} from '@/modules/reports/actions/result-term-fetch-actions';
import type { ResultTermSummary } from '@/modules/reports/queries/result-term-queries';
import type { GazetteData } from '@/modules/reports/types/report-types';

type Props = { terms: ResultTermSummary[] };
type Section = { id: string; name: string };

export function GazetteClient({ terms }: Props) {
  const [isPending, startTransition] = useTransition();
  const [termId, setTermId] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [sectionId, setSectionId] = useState('');
  const [gazetteData, setGazetteData] = useState<GazetteData | null>(null);

  const selectedTerm = terms.find((t) => t.id === termId);

  function handleTermChange(id: string) {
    setTermId(id);
    setSections([]);
    setSectionId('');
    setGazetteData(null);
    if (!id) return;
    const term = terms.find((t) => t.id === id);
    if (!term) return;
    startTransition(async () => {
      const secs = await getSectionsForClassAction(term.class.id);
      setSections(secs);
    });
  }

  function handleLoad() {
    if (!termId || !sectionId) { toast.error('Select a result term and section'); return; }
    startTransition(async () => {
      const data = await getGazetteDataAction(termId, sectionId);
      if (!data) { toast.error('No data found — run consolidation first'); return; }
      setGazetteData(data);
    });
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>Result Term</Label>
              <Select value={termId} onValueChange={handleTermChange}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  {terms.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.class.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Select value={sectionId} onValueChange={setSectionId} disabled={!sections.length}>
                <SelectTrigger><SelectValue placeholder="Select section" /></SelectTrigger>
                <SelectContent>
                  {sections.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={handleLoad} disabled={!termId || !sectionId || isPending} className="flex-1">
                {isPending ? 'Loading...' : 'Load Gazette'}
              </Button>
              {gazetteData && (
                <Button variant="outline" onClick={() => window.print()}>
                  <Printer className="mr-2 h-4 w-4" /> Print
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {gazetteData && (
        <div className="no-print grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Students', value: gazetteData.summary.totalStudents },
            { label: 'Passed', value: gazetteData.summary.passedStudents },
            { label: 'Failed', value: gazetteData.summary.failedStudents },
            { label: 'Pass Rate', value: `${gazetteData.summary.passRate.toFixed(1)}%` },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="py-3 px-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Gazette Table */}
      {!gazetteData && !isPending && (
        <EmptyState
          icon={<TableIcon className="h-12 w-12 text-muted-foreground" />}
          title="No gazette loaded"
          description="Select a result term and section, then click Load Gazette"
        />
      )}

      {isPending && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          Loading gazette data...
        </div>
      )}

      {gazetteData && !isPending && (
        <GazettePrintTemplate gazette={gazetteData} />
      )}
    </div>
  );
}
