/**
 * Lightweight CSV parser — no external deps.
 * Handles quoted fields, commas inside quotes, escaped quotes.
 */
export function parseCsv<T extends Record<string, string>>(
  text: string,
): { headers: string[]; rows: T[] } {
  const lines = splitCsvLines(text);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = parseCsvLine(lines[0]!);
  const rows: T[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    if (values.length === 0 || values.every((v) => v === '')) continue;

    const row = {} as Record<string, string>;
    headers.forEach((h, idx) => {
      row[h.trim()] = values[idx]?.trim() ?? '';
    });
    rows.push(row as T);
  }

  return { headers, rows };
}

function splitCsvLines(text: string): string[] {
  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      current += ch;
    } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (current.length > 0) lines.push(current);
      current = '';
      if (ch === '\r' && text[i + 1] === '\n') i++; // skip \r\n
    } else {
      current += ch;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

/** Trigger browser download of a CSV string */
export function downloadCsv(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
