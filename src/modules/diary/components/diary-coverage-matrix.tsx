'use client';

import { COVERAGE_CELL } from '../diary.constants';
import type { DiaryCoverageData } from '../diary.types';

type Props = {
  data: DiaryCoverageData;
  onCellClick?: (teacherProfileId: string, date: string) => void;
  className?: string;
};

export function DiaryCoverageMatrix({ data, onCellClick, className }: Props) {
  const { rows, dates } = data;

  if (rows.length === 0 || dates.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No coverage data available for the selected period.
      </div>
    );
  }

  // Format date headers (short: "Mon 3")
  const dateHeaders = dates.map((d) => {
    const date = new Date(d + 'T00:00:00');
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNum = date.getDate();
    return { full: d, label: `${dayName} ${dayNum}` };
  });

  return (
    <div className={`overflow-x-auto ${className ?? ''}`}>
      <table className="w-full min-w-150 text-sm">
        <thead>
          <tr className="border-b">
            <th className="sticky left-0 z-10 bg-background px-3 py-2 text-left font-medium">
              Teacher
            </th>
            {dateHeaders.map((dh) => (
              <th key={dh.full} className="px-2 py-2 text-center font-medium whitespace-nowrap">
                {dh.label}
              </th>
            ))}
            <th className="px-3 py-2 text-center font-medium">Coverage</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.teacherProfileId} className="border-b last:border-0">
              <td className="sticky left-0 z-10 bg-background px-3 py-2">
                <div className="font-medium text-sm">{row.teacherName}</div>
                <div className="text-xs text-muted-foreground">{row.employeeId}</div>
              </td>
              {dates.map((date) => {
                const cell = row.dates[date];
                if (!cell) {
                  return (
                    <td key={date} className="px-2 py-2 text-center">
                      <CoverageCell type="NO_DATA" />
                    </td>
                  );
                }
                const type = cell.submitted >= cell.expected
                  ? 'FULL'
                  : cell.submitted > 0
                    ? 'PARTIAL'
                    : 'MISSING';
                return (
                  <td key={date} className="px-2 py-2 text-center">
                    <CoverageCell
                      type={type}
                      onClick={() => onCellClick?.(row.teacherProfileId, date)}
                    />
                  </td>
                );
              })}
              <td className="px-3 py-2 text-center">
                <span className={`text-sm font-semibold ${
                  row.coveragePercent >= 80 ? 'text-emerald-700'
                    : row.coveragePercent >= 50 ? 'text-amber-700'
                      : 'text-red-700'
                }`}>
                  {row.coveragePercent}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2">
            <td className="sticky left-0 z-10 bg-background px-3 py-2 font-semibold">
              Overall
            </td>
            {dates.map((date) => {
              const total = rows.length;
              const submitted = rows.filter((r) => {
                const c = r.dates[date];
                return c && c.submitted > 0;
              }).length;
              const pct = total > 0 ? Math.round((submitted / total) * 100) : 0;
              return (
                <td key={date} className="px-2 py-2 text-center">
                  <span className={`text-xs font-semibold ${
                    pct >= 80 ? 'text-emerald-700'
                      : pct >= 50 ? 'text-amber-700'
                        : 'text-red-700'
                  }`}>
                    {pct}%
                  </span>
                </td>
              );
            })}
            <td className="px-3 py-2 text-center">
              <span className="text-sm font-bold">{data.overallCoverage}%</span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function CoverageCell({ type, onClick }: { type: keyof typeof COVERAGE_CELL; onClick?: () => void }) {
  const config = COVERAGE_CELL[type];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick || type === 'NO_DATA'}
      className={`inline-flex h-7 w-7 items-center justify-center rounded text-xs ${config.color} ${
        onClick && type !== 'NO_DATA' ? 'cursor-pointer hover:ring-2 hover:ring-offset-1' : ''
      }`}
    >
      {config.icon}
    </button>
  );
}
