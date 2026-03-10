'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import type { QuestionAnalytics } from '@/modules/results/result-queries';

type SortKey = 'number' | 'accuracy' | 'difficulty' | 'discrimination';

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  if (!active) return <Minus className="ml-1 inline h-3 w-3 text-muted-foreground" />;
  return asc ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />;
}

function getDifficultyBadge(idx: number) {
  if (idx >= 0.7) return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Easy</Badge>;
  if (idx >= 0.3) return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">Medium</Badge>;
  return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">Hard</Badge>;
}

function getDiscriminationBadge(idx: number) {
  if (idx >= 0.3) return <Badge variant="outline" className="border-green-500 text-green-700">Good</Badge>;
  if (idx >= 0.1) return <Badge variant="outline" className="border-amber-500 text-amber-700">Fair</Badge>;
  return <Badge variant="outline" className="border-red-500 text-red-700">Poor</Badge>;
}

export function QuestionPerformanceTable({ questions }: { questions: QuestionAnalytics[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('number');
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...questions].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'number': cmp = a.questionNumber - b.questionNumber; break;
      case 'accuracy': cmp = a.accuracyRate - b.accuracyRate; break;
      case 'difficulty': cmp = a.difficultyIndex - b.difficultyIndex; break;
      case 'discrimination': cmp = a.discriminationIndex - b.discriminationIndex; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Performance Details</CardTitle>
        <CardDescription>Click column headers to sort</CardDescription>
      </CardHeader>
      <CardContent>
        {/* ── Mobile Card View ── */}
        <div className="space-y-2 md:hidden">
          {sorted.map((q) => (
            <div key={q.examQuestionId} className="rounded-lg border bg-card p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Q{q.questionNumber}</p>
                <span className={cn(
                  'text-sm font-medium',
                  q.accuracyRate >= 70 ? 'text-green-600' :
                  q.accuracyRate >= 40 ? 'text-amber-600' : 'text-red-600',
                )}>
                  {q.accuracyRate.toFixed(1)}% accuracy
                </span>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{q.title}</p>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary" className="text-[10px]">{q.type.replace('_', ' ')}</Badge>
                <Badge variant="outline" className="text-[10px]">{q.maxMarks}m</Badge>
                {getDifficultyBadge(q.difficultyIndex)}
                {getDiscriminationBadge(q.discriminationIndex)}
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                <div className="rounded bg-green-50 dark:bg-green-950/30 p-1">
                  <p className="font-medium text-green-700 dark:text-green-400">{q.correctCount}</p>
                  <p className="text-muted-foreground">Correct</p>
                </div>
                <div className="rounded bg-amber-50 dark:bg-amber-950/30 p-1">
                  <p className="font-medium text-amber-700 dark:text-amber-400">{q.partialCount}</p>
                  <p className="text-muted-foreground">Partial</p>
                </div>
                <div className="rounded bg-red-50 dark:bg-red-950/30 p-1">
                  <p className="font-medium text-red-700 dark:text-red-400">{q.wrongCount}</p>
                  <p className="text-muted-foreground">Wrong</p>
                </div>
                <div className="rounded bg-muted p-1">
                  <p className="font-medium">{q.unansweredCount}</p>
                  <p className="text-muted-foreground">Skip</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Desktop Table View ── */}
        <div className="hidden md:block overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer select-none whitespace-nowrap" onClick={() => handleSort('number')}>
                  # <SortIcon active={sortKey === 'number'} asc={sortAsc} />
                </TableHead>
                <TableHead className="min-w-50">Question</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Marks</TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('accuracy')}>
                  Accuracy <SortIcon active={sortKey === 'accuracy'} asc={sortAsc} />
                </TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Partial</TableHead>
                <TableHead className="text-center">Wrong</TableHead>
                <TableHead className="text-center">Skipped</TableHead>
                <TableHead className="text-center whitespace-nowrap">Avg Marks</TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('difficulty')}>
                  Difficulty <SortIcon active={sortKey === 'difficulty'} asc={sortAsc} />
                </TableHead>
                <TableHead className="cursor-pointer select-none text-center whitespace-nowrap" onClick={() => handleSort('discrimination')}>
                  Discrim. <SortIcon active={sortKey === 'discrimination'} asc={sortAsc} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((q) => (
                <TableRow key={q.examQuestionId}>
                  <TableCell className="font-medium">Q{q.questionNumber}</TableCell>
                  <TableCell className="max-w-62.5 truncate text-sm">{q.title}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="text-xs">{q.type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{q.maxMarks}</TableCell>
                  <TableCell className="text-center font-medium">
                    <span className={cn(
                      q.accuracyRate >= 70 ? 'text-green-600' :
                      q.accuracyRate >= 40 ? 'text-amber-600' : 'text-red-600',
                    )}>
                      {q.accuracyRate.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-green-600">{q.correctCount}</TableCell>
                  <TableCell className="text-center text-amber-600">{q.partialCount}</TableCell>
                  <TableCell className="text-center text-red-600">{q.wrongCount}</TableCell>
                  <TableCell className="text-center text-muted-foreground">{q.unansweredCount}</TableCell>
                  <TableCell className="text-center">{q.avgMarksAwarded.toFixed(1)} / {q.maxMarks}</TableCell>
                  <TableCell className="text-center">{getDifficultyBadge(q.difficultyIndex)}</TableCell>
                  <TableCell className="text-center">{getDiscriminationBadge(q.discriminationIndex)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
