'use client';

import { useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCsv } from '@/utils/csv';
import { toast } from 'sonner';

type ImportResult = {
  total: number;
  created: number;
  skipped?: number;
  errors: { row: number; error: string }[];
};

type CsvImportDialogProps = {
  title: string;
  description: string;
  requiredColumns: string[];
  optionalColumns?: string[];
  onImport: (rows: Record<string, string>[]) => Promise<ImportResult>;
  sampleCsv?: string;
};

export function CsvImportDialog({
  title,
  description,
  requiredColumns,
  optionalColumns = [],
  onImport,
  sampleCsv,
}: CsvImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[] | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows } = parseCsv(text);
      setPreview(rows.slice(0, 5)); // preview first 5 rows
      setResult(null);
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (!fileRef.current?.files?.[0]) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const { rows } = parseCsv(text);

      startTransition(async () => {
        try {
          const res = await onImport(rows);
          setResult(res);
          toast.success(`Imported ${res.created} of ${res.total} records`);
        } catch {
          toast.error('Import failed');
        }
      });
    };
    reader.readAsText(fileRef.current.files[0]);
  }

  function handleDownloadSample() {
    if (!sampleCsv) return;
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-import.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setPreview(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <p className="text-muted-foreground text-sm">{description}</p>

        <ColumnInfo
          requiredColumns={requiredColumns}
          optionalColumns={optionalColumns}
        />

        {sampleCsv && (
          <Button variant="link" size="sm" className="px-0" onClick={handleDownloadSample}>
            <FileText className="mr-1 h-4 w-4" />
            Download sample CSV
          </Button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm file:mr-4 file:rounded file:border-0
                     file:bg-primary file:px-4 file:py-2 file:text-sm
                     file:font-semibold file:text-primary-foreground"
        />

        {preview && <PreviewTable rows={preview} />}

        {result && <ImportSummary result={result} />}

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
          <Button onClick={handleImport} disabled={!preview || isPending}>
            {isPending ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Sub-components ── */

function ColumnInfo({
  requiredColumns,
  optionalColumns,
}: {
  requiredColumns: string[];
  optionalColumns: string[];
}) {
  return (
    <div className="text-xs space-y-1">
      <p>
        <span className="font-medium">Required:</span>{' '}
        {requiredColumns.join(', ')}
      </p>
      {optionalColumns.length > 0 && (
        <p>
          <span className="font-medium">Optional:</span>{' '}
          {optionalColumns.join(', ')}
        </p>
      )}
    </div>
  );
}

function PreviewTable({ rows }: { rows: Record<string, string>[] }) {
  if (rows.length === 0) return null;
  const cols = Object.keys(rows[0]!);

  return (
    <div className="max-h-40 overflow-auto rounded border text-xs">
      <table className="w-full">
        <thead>
          <tr className="bg-muted">
            {cols.map((c) => (
              <th key={c} className="px-2 py-1 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t">
              {cols.map((c) => (
                <td key={c} className="px-2 py-1 truncate max-w-[120px]">
                  {row[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ImportSummary({ result }: { result: ImportResult }) {
  return (
    <div className="space-y-2 rounded border p-3 text-sm">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        Created: {result.created} / {result.total}
      </div>
      {(result.skipped ?? 0) > 0 && (
        <p className="text-muted-foreground">Skipped: {result.skipped}</p>
      )}
      {result.errors.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-destructive">
            <AlertCircle className="h-4 w-4" />
            Errors: {result.errors.length}
          </div>
          <ul className="max-h-24 overflow-auto text-xs text-destructive/80">
            {result.errors.slice(0, 10).map((e, i) => (
              <li key={i}>Row {e.row}: {e.error}</li>
            ))}
            {result.errors.length > 10 && (
              <li>…and {result.errors.length - 10} more</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
