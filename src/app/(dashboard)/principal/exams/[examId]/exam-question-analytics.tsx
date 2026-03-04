'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import type { ExamDetailedAnalytics } from '@/modules/results/result-queries';

type Props = {
  questions: ExamDetailedAnalytics['questions'];
};

export function ExamQuestionAnalytics({ questions }: Props) {
  if (questions.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Per-Question Analytics</CardTitle>
        <CardDescription>
          Detailed breakdown of each question&apos;s performance, difficulty, and discrimination
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Mobile View */}
        <div className="space-y-4 lg:hidden">
          {questions.map((q) => (
            <div key={q.examQuestionId} className="rounded-lg border p-4">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">Q{q.questionNumber}</p>
                  <p className="text-muted-foreground max-w-62.5 truncate text-xs">{q.title}</p>
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                  <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center">
                  <p className="text-muted-foreground">Accuracy</p>
                  <p className="font-bold">{Math.round(q.accuracyRate)}%</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Avg Marks</p>
                  <p className="font-bold">{Math.round(q.avgMarksAwarded * 10) / 10}/{q.maxMarks}</p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Attempted</p>
                  <p className="font-bold">{q.attemptedCount}/{q.totalStudents}</p>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={q.accuracyRate} className="h-1.5" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px]">
                <span>
                  DI: {Math.round(q.difficultyIndex * 100)}% · Disc: {Math.round(q.discriminationIndex * 100) / 100}
                </span>
                {q.avgTimeSpent !== null && <span>{Math.round(q.avgTimeSpent)}s avg</span>}
              </div>
              {q.optionAnalysis.length > 0 && (
                <div className="mt-2 space-y-1 border-t pt-2">
                  {q.optionAnalysis.map((opt) => (
                    <div key={opt.label} className="flex items-center gap-2 text-xs">
                      <span className={`w-6 text-center font-medium ${opt.isCorrect ? 'text-green-600' : ''}`}>
                        {opt.label}
                      </span>
                      <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className={`h-full rounded-full ${opt.isCorrect ? 'bg-green-500' : 'bg-gray-400'}`}
                          style={{ width: `${Math.min(opt.selectionPercentage, 100)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground w-10 text-right">
                        {Math.round(opt.selectionPercentage)}%
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead className="text-center">Marks</TableHead>
                <TableHead className="text-center">Attempted</TableHead>
                <TableHead className="text-center">Correct</TableHead>
                <TableHead className="text-center">Partial</TableHead>
                <TableHead className="text-center">Wrong</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">DI</TableHead>
                <TableHead className="text-right">Disc.</TableHead>
                <TableHead className="text-right">Avg Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((q) => (
                <TableRow key={q.examQuestionId}>
                  <TableCell className="font-medium">Q{q.questionNumber}</TableCell>
                  <TableCell>
                    <span className="block max-w-62.5 truncate text-sm">{q.title}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{q.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <DifficultyBadge difficulty={q.difficulty} />
                  </TableCell>
                  <TableCell className="text-center">
                    {Math.round(q.avgMarksAwarded * 10) / 10}/{q.maxMarks}
                  </TableCell>
                  <TableCell className="text-center">{q.attemptedCount}/{q.totalStudents}</TableCell>
                  <TableCell className="text-center text-green-600">{q.correctCount}</TableCell>
                  <TableCell className="text-center text-yellow-600">{q.partialCount}</TableCell>
                  <TableCell className="text-center text-red-600">{q.wrongCount}</TableCell>
                  <TableCell className="text-right">
                    <span className={q.accuracyRate >= 50 ? 'text-green-600' : 'text-red-600'}>
                      {Math.round(q.accuracyRate)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{Math.round(q.difficultyIndex * 100)}%</TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        q.discriminationIndex >= 0.3
                          ? 'text-green-600'
                          : q.discriminationIndex >= 0.1
                            ? 'text-yellow-600'
                            : 'text-red-600'
                      }
                    >
                      {Math.round(q.discriminationIndex * 100) / 100}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right">
                    {q.avgTimeSpent !== null ? `${Math.round(q.avgTimeSpent)}s` : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const color =
    difficulty === 'HARD'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      : difficulty === 'MEDIUM'
        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';

  return (
    <Badge className={color} variant="secondary">
      {difficulty}
    </Badge>
  );
}
