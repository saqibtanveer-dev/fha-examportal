'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Tag } from 'lucide-react';
import { createTagAction, deleteTagAction } from '@/modules/tags/tag-actions';
import { toast } from 'sonner';

type TagItem = {
  id: string;
  name: string;
  category: string;
  _count: { questionTags: number };
};

type Props = { tags: TagItem[] };

const categoryLabels: Record<string, string> = {
  TOPIC: 'Topic',
  DIFFICULTY: 'Difficulty',
  BLOOM_LEVEL: 'Bloom Level',
  CUSTOM: 'Custom',
};

const categoryColors: Record<string, string> = {
  TOPIC: 'bg-blue-100 text-blue-800',
  DIFFICULTY: 'bg-orange-100 text-orange-800',
  BLOOM_LEVEL: 'bg-purple-100 text-purple-800',
  CUSTOM: 'bg-gray-100 text-gray-800',
};

export function TagManager({ tags }: Props) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('TOPIC');
  const router = useRouter();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      const result = await createTagAction({
        name: name.trim(),
        category: category as 'TOPIC' | 'DIFFICULTY' | 'BLOOM_LEVEL' | 'CUSTOM',
      });
      if (result.success) {
        toast.success('Tag created');
        setName('');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTagAction(id);
      if (result.success) {
        toast.success('Tag deleted');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Tag className="h-4 w-4" />
          Tags ({tags.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Tag name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} disabled={isPending || !name.trim()} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tags yet</p>
          ) : (
            tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className={`gap-1 ${categoryColors[tag.category] ?? ''}`}
              >
                {tag.name}
                <span className="text-xs opacity-60">({tag._count.questionTags})</span>
                {tag._count.questionTags === 0 && (
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="ml-1 rounded-sm p-0.5 hover:text-destructive"
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </Badge>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
