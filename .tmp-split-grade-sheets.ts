import * as XLSX from 'xlsx';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

async function main() {
  const src = resolve('exports/grade-9-10-login-sheets-latest.xlsx');
  const wb = XLSX.readFile(src);
  const outDir = resolve('exports');
  await mkdir(outDir, { recursive: true });

  for (const name of wb.SheetNames) {
    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, wb.Sheets[name], name);
    const safe = name.toLowerCase().replace(/\s+/g, '-');
    XLSX.writeFile(outWb, resolve(outDir, `${safe}.xlsx`));
  }

  console.log('Created separate files for:', wb.SheetNames.join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
