'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import type { QuestionAnalytics } from '@/modules/results/result-queries';
import { CHART_COLORS, OPTION_COLORS } from './analytics-shared';

// ─── Accuracy Stacked Bar ───────────────────────────────────────────

export function QuestionAccuracyChart({ questions }: { questions: QuestionAnalytics[] }) {
  const chartData = questions.map((q) => {
    const total = Math.max(q.correctCount + q.partialCount + q.wrongCount, 1);
    return {
      name: `Q${q.questionNumber}`,
      accuracy: Number(q.accuracyRate.toFixed(1)),
      partial: Number(((q.partialCount / total) * 100).toFixed(1)),
      wrong: Number(((q.wrongCount / total) * 100).toFixed(1)),
    };
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Accuracy Rate</CardTitle>
        <CardDescription>Percentage of students who answered each question correctly</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis type="number" domain={[0, 100]} unit="%" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis dataKey="name" type="category" width={40} fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={((value: number, name: string) => [`${value}%`, name === 'accuracy' ? 'Correct' : name === 'partial' ? 'Partial' : 'Wrong']) as never}
              />
              <Legend formatter={(value: string) => (value === 'accuracy' ? 'Correct' : value === 'partial' ? 'Partial' : 'Wrong')} />
              <Bar dataKey="accuracy" stackId="a" fill={CHART_COLORS.green} />
              <Bar dataKey="partial" stackId="a" fill={CHART_COLORS.amber} />
              <Bar dataKey="wrong" stackId="a" fill={CHART_COLORS.red} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Difficulty vs Discrimination Scatter ────────────────────────────

export function DifficultyDiscriminationChart({ questions }: { questions: QuestionAnalytics[] }) {
  const scatterData = questions.map((q) => ({
    name: `Q${q.questionNumber}`,
    x: Number(q.difficultyIndex.toFixed(2)),
    y: Number(q.discriminationIndex.toFixed(2)),
    type: q.type,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Difficulty vs Discrimination</CardTitle>
        <CardDescription>
          X = Difficulty Index (higher = easier), Y = Discrimination Index (higher = better differentiator)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="x" type="number" domain={[0, 1]} name="Difficulty" fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Difficulty Index', position: 'insideBottom', offset: -5, style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
              />
              <YAxis
                dataKey="y" type="number" domain={[-1, 1]} name="Discrimination" fontSize={11}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                label={{ value: 'Discrimination', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 10 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                formatter={((value: number, name: string) => [value.toFixed(2), name]) as never}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name ?? ''}
              />
              <Scatter data={scatterData} fill={CHART_COLORS.purple}>
                {scatterData.map((entry, i) => (
                  <Cell key={i} fill={entry.y >= 0.3 ? CHART_COLORS.green : entry.y >= 0.1 ? CHART_COLORS.amber : CHART_COLORS.red} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Good (&ge;0.3)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Acceptable (0.1–0.3)</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Poor (&lt;0.1)</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── MCQ Option Breakdown ────────────────────────────────────────────

export function McqOptionBreakdown({ questions }: { questions: QuestionAnalytics[] }) {
  const mcqQuestions = questions.filter((q) => q.type === 'MCQ' && q.optionAnalysis.length > 0);
  if (mcqQuestions.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">MCQ Option Distribution</CardTitle>
        <CardDescription>How students distributed their answers across options</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mcqQuestions.map((q) => {
            const chartData = q.optionAnalysis.map((opt) => ({
              name: opt.label,
              value: opt.selectionCount,
              percentage: Number(opt.selectionPercentage.toFixed(1)),
              isCorrect: opt.isCorrect,
              text: opt.text.length > 40 ? `${opt.text.slice(0, 40)}...` : opt.text,
            }));

            return (
              <div key={q.examQuestionId} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Q{q.questionNumber}</Badge>
                  <span className="text-sm font-medium">{q.title.length > 80 ? `${q.title.slice(0, 80)}...` : q.title}</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="name" fontSize={12} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <YAxis allowDecimals={false} fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                        formatter={((value: number, _name: string, props: { payload: { percentage: number; text: string } }) => [
                          `${value} students (${props.payload.percentage}%)`,
                          props.payload.text,
                        ]) as never}
                      />
                      <Bar dataKey="value" name="Selections" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell key={i} fill={entry.isCorrect ? CHART_COLORS.green : OPTION_COLORS[i % OPTION_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Radar Chart ─────────────────────────────────────────────────────

export function QuestionRadarChart({ questions }: { questions: QuestionAnalytics[] }) {
  if (questions.length < 3) return null;

  const radarData = questions.map((q) => ({
    question: `Q${q.questionNumber}`,
    accuracy: Number(q.accuracyRate.toFixed(1)),
    avgMarksPercent: q.maxMarks > 0 ? Number(((q.avgMarksAwarded / q.maxMarks) * 100).toFixed(1)) : 0,
  }));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Question Performance Radar</CardTitle>
        <CardDescription>Accuracy rate vs average marks percentage per question</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-border" />
              <PolarAngleAxis dataKey="question" fontSize={11} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <Radar name="Accuracy %" dataKey="accuracy" stroke={CHART_COLORS.green} fill={CHART_COLORS.green} fillOpacity={0.2} />
              <Radar name="Avg Marks %" dataKey="avgMarksPercent" stroke={CHART_COLORS.blue} fill={CHART_COLORS.blue} fillOpacity={0.1} />
              <Legend />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
