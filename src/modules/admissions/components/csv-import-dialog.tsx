'use client';

import { useState, useTransition, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared';
import { Upload, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { importCsvQuestionsAction } from '../admission-actions';
import { useInvalidateCache } from '@/lib/cache-utils';
import { PAPER_VERSIONS } from '@/lib/constants';

type ParsedRow = {
  title: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  marks: number;
  sectionLabel?: string;
  paperVersion?: string;
};

type Props = {
  campaignId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CsvImportDialog({ campaignId, open, onOpenChange }: Props) {
  const [isPending, startTransition] = useTransition();
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [defaultVersion, setDefaultVersion] = useState('A');
  const invalidate = useInvalidateCache();

  const parseCsv = useCallback((text: string) => {
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) {
      setErrors(['CSV must have a header row and at least one data row.']);
      return;
    }

    // Skip header row
    const dataLines = lines.slice(1);
    const parsed: ParsedRow[] = [];
    const parseErrors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i]!;
      const cols = parseCsvLine(line);
      if (cols.length < 7) {
        parseErrors.push(`Row ${i + 2}: Expected at least 7 columns, got ${cols.length}`);
        continue;
      }

      const [title, optA, optB, optC, optD, correct, marksStr, section] = cols;
      const correctUpper = correct?.trim().toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(correctUpper ?? '')) {
        parseErrors.push(`Row ${i + 2}: correctOption must be A, B, C, or D (got "${correct}")`);
        continue;
      }

      const marks = Number(marksStr?.trim());
      if (isNaN(marks) || marks <= 0) {
        parseErrors.push(`Row ${i + 2}: marks must be a positive number (got "${marksStr}")`);
        continue;
      }

      if (!title?.trim()) {
        parseErrors.push(`Row ${i + 2}: title is empty`);
        continue;
      }

      parsed.push({
        title: title!.trim(),
        optionA: optA?.trim() ?? '',
        optionB: optB?.trim() ?? '',
        optionC: optC?.trim() ?? '',
        optionD: optD?.trim() ?? '',
        correctOption: correctUpper as ParsedRow['correctOption'],
        marks,
        sectionLabel: section?.trim() || undefined,
        paperVersion: cols[8]?.trim() || undefined,
      });
    }

    setRows(parsed);
    setErrors(parseErrors);
  }, []);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseCsv(ev.target?.result as string);
    reader.readAsText(file);
  }

  function handleImport() {
    if (rows.length === 0) return;
    startTransition(async () => {
      const result = await importCsvQuestionsAction({
        campaignId,
        questions: rows,
        defaultPaperVersion: defaultVersion,
      });
      if (result.success && result.data) {
        toast.success(`${(result.data as { imported: number }).imported} questions imported`);
        invalidate.campaigns();
        handleClose();
      } else {
        toast.error(result.error ?? 'Import failed');
      }
    });
  }

  function handleClose() {
    setRows([]);
    setErrors([]);
    setDefaultVersion('A');
    onOpenChange(false);
  }

  function downloadTemplate() {
    const csv = 'title,optionA,optionB,optionC,optionD,correctOption,marks,sectionLabel,paperVersion\n'
      + '"What is 2+2?","1","2","3","4","D",1,"Math","A"\n'
      + '"Capital of Pakistan?","Lahore","Karachi","Islamabad","Peshawar","C",1,"General Knowledge","B"\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Questions from CSV
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file with MCQ questions. Each row becomes one question.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template download */}
          <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
            <Download className="h-4 w-4" />
            Download CSV Template
          </Button>

          {/* Default Paper Version */}
          <div className="space-y-1">
            <Label className="text-sm">Default Paper Version</Label>
            <Select value={defaultVersion} onValueChange={setDefaultVersion}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_VERSIONS.map((v) => (
                  <SelectItem key={v} value={v}>
                    Version {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used when CSV rows don&apos;t specify a paperVersion column.
            </p>
          </div>

          {/* File input */}
          <div className="flex items-center gap-3 rounded-md border border-dashed p-4">
            <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
            <div className="flex-1">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileSelect}
                className="text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:text-primary-foreground file:cursor-pointer"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Format: title, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), marks, sectionLabel, paperVersion (optional)
              </p>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive/50 bg-destructive/5 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" />
                {errors.length} parsing error(s)
              </div>
              <ul className="mt-1 max-h-32 overflow-y-auto text-xs text-destructive/80 space-y-0.5">
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          {/* Preview summary */}
          {rows.length > 0 && (
            <div className="rounded-md border bg-green-50 p-3 dark:bg-green-950/20">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                {rows.length} question(s) ready to import
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Total marks: {rows.reduce((sum, r) => sum + r.marks, 0)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isPending || rows.length === 0}>
            {isPending ? <Spinner size="sm" className="mr-2" /> : null}
            Import {rows.length > 0 ? `(${rows.length})` : ''} Questions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Parse a single CSV line respecting quoted fields.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
