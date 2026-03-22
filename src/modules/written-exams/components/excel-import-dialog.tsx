'use client';

import { useRef, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Spinner } from '@/components/shared';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload, FileSpreadsheet, AlertCircle,
  CheckCircle2, FileWarning, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExcelImport } from '@/modules/written-exams/hooks/use-excel-import';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  isFinalized: boolean;
};

export function ImportDialog({ open, onOpenChange, examId, isFinalized }: Props) {
  const { state, parseFile, confirmImport, reset } = useExcelImport(examId);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.xlsx')) return;
      parseFile(file);
    },
    [parseFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(v); }}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
            Import Marks from Excel
          </DialogTitle>
          <DialogDescription>
            Upload the marks template file with entered marks. Only .xlsx files exported from this system are supported.
          </DialogDescription>
        </DialogHeader>

        {state.status === 'idle' && (
          <div
            className={cn(
              'flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors',
              dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            )}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
          >
            <div className="rounded-full bg-muted p-3">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">Drop your Excel file here</p>
              <p className="mt-1 text-xs text-muted-foreground">or click to browse</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="mt-1">
              Choose File
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFile(file); e.target.value = ''; }}
            />
          </div>
        )}

        {state.status === 'parsing' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Reading Excel file...</p>
          </div>
        )}

        {state.status === 'preview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <PreviewStat label="Students" value={state.result.studentCount} icon={CheckCircle2} color="text-green-600 dark:text-green-400" />
              <PreviewStat label="Entries" value={state.result.entries.length} icon={FileSpreadsheet} color="text-blue-600 dark:text-blue-400" />
              {state.result.absentSessionIds.length > 0 && (
                <PreviewStat label="Mark Absent" value={state.result.absentSessionIds.length} icon={X} color="text-red-600 dark:text-red-400" />
              )}
              {state.result.unmarkAbsentSessionIds.length > 0 && (
                <PreviewStat label="Unmark Absent" value={state.result.unmarkAbsentSessionIds.length} icon={CheckCircle2} color="text-emerald-600 dark:text-emerald-400" />
              )}
            </div>
            {state.result.errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-400">
                  <FileWarning className="h-4 w-4 shrink-0" />
                  {state.result.errors.length} warning{state.result.errors.length !== 1 ? 's' : ''}
                </div>
                <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-amber-700 dark:text-amber-300">
                  {state.result.errors.map((err, i) => (
                    <li key={i} className="leading-tight">• {err}</li>
                  ))}
                </ul>
              </div>
            )}
            <DialogFooter className="flex-col gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={handleClose} className="min-h-10">Cancel</Button>
              <Button
                onClick={() => confirmImport(state.result)}
                disabled={
                  (
                    state.result.entries.length === 0
                    && state.result.absentSessionIds.length === 0
                    && state.result.unmarkAbsentSessionIds.length === 0
                  )
                  || isFinalized
                }
                className="min-h-10"
              >
                <Upload className="mr-1.5 h-4 w-4" />Apply Import
              </Button>
            </DialogFooter>
          </div>
        )}

        {state.status === 'importing' && (
          <div className="space-y-3 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Importing marks...</span>
              <span className="font-medium tabular-nums">{state.progress}/{state.total} batches</span>
            </div>
            <Progress value={state.total > 0 ? (state.progress / state.total) * 100 : 0} className="h-2" />
            <p className="text-center text-xs text-muted-foreground">Please don&apos;t close this window</p>
          </div>
        )}

        {state.status === 'done' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-medium">Import Complete</p>
              <p className="mt-1 text-sm text-muted-foreground">{state.imported} mark entries imported successfully.</p>
            </div>
            <Button onClick={handleClose} className="mt-2 min-h-10">Done</Button>
          </div>
        )}

        {state.status === 'error' && (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="rounded-full bg-destructive/10 p-3">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-medium">Import Failed</p>
              <p className="mt-1 text-sm text-muted-foreground">{state.message}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose} className="min-h-10">Cancel</Button>
              <Button onClick={reset} className="min-h-10">Try Again</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PreviewStat({ label, value, icon: Icon, color }: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border p-2.5">
      <Icon className={cn('h-4 w-4 shrink-0', color)} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-none">{label}</p>
        <p className="text-lg font-bold tabular-nums leading-tight">{value}</p>
      </div>
    </div>
  );
}
