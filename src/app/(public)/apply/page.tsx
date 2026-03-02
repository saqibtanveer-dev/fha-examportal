'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/shared';
import { fetchPublicCampaignsAction } from '@/modules/admissions/admission-fetch-actions';
import { GraduationCap, Calendar, Clock, Users, ArrowRight, Trophy } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

type Campaign = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  testDuration: number;
  totalMarks: number;
  hasScholarship: boolean;
  registrationEndAt: string | null;
  testStartAt: string | null;
};

export default function ApplyPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicCampaignsAction().then((r) => {
      if (r.success && r.data) setCampaigns(r.data as Campaign[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <GraduationCap className="mx-auto mb-4 h-12 w-12 text-primary" />
        <h1 className="text-3xl font-bold">Admission & Scholarship Tests</h1>
        <p className="mt-2 text-muted-foreground">
          Select a test campaign below to register and apply
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : campaigns.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-12">
            <p className="text-muted-foreground">No open campaigns at the moment. Please check back later.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {campaigns.map((c) => (
            <Card key={c.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <CardDescription className="mt-1">{c.description}</CardDescription>
                  </div>
                  {c.hasScholarship && (
                    <Badge variant="outline" className="shrink-0 border-yellow-300 bg-yellow-50 text-yellow-700">
                      <Trophy className="mr-1 h-3 w-3" />Scholarship
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{c.testDuration} minutes • {c.totalMarks} marks</span>
                  </div>
                  {c.registrationEndAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {format(new Date(c.registrationEndAt), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-xs">{c.type.replace('_', ' ').toLowerCase()} test</span>
                  </div>
                </div>
                <Link href={`/apply/${c.slug}`}>
                  <Button className="w-full">
                    Apply Now <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
