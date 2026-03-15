import { Link2, Link2Off, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ResultTermWithGroups } from '@/modules/reports/types/report-types';

type Group = ResultTermWithGroups['examGroups'][number];

type Props = {
  group: Group;
  isPending: boolean;
  isPublished: boolean;
  onLinkExam: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  onUnlinkExam: (linkId: string) => void;
};

export function ResultTermGroupCard({
  group,
  isPending,
  isPublished,
  onLinkExam,
  onRemoveGroup,
  onUnlinkExam,
}: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base">{group.name}</CardTitle>
            <Badge variant="outline">{group.weight}%</Badge>
            <Badge variant="secondary" className="text-xs">
              {group.aggregateMode}
            </Badge>
            {group.bestOfCount && (
              <Badge variant="secondary" className="text-xs">
                Best of {group.bestOfCount}
              </Badge>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onLinkExam(group.id)}
              disabled={isPublished || isPending}
            >
              <Link2 className="mr-1.5 h-3.5 w-3.5" /> Link Exam
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => onRemoveGroup(group.id)}
              disabled={isPublished}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {group.examLinks.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No exams linked</p>
        ) : (
          <div className="space-y-1.5">
            {group.examLinks.map((link) => (
              <div
                key={link.id}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <span className="font-medium">{link.exam.title}</span>
                  <span className="ml-2 text-muted-foreground">
                    {link.exam.subjectName} · {link.exam.totalMarks} marks · {link.exam.type}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  onClick={() => onUnlinkExam(link.id)}
                  disabled={isPublished || isPending}
                >
                  <Link2Off className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
