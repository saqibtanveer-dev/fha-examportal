export type ConsolidationJobSnapshot = {
  resultTermId: string;
  status: 'IDLE' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  lastEventAt: Date | null;
  computedAt: Date | null;
  counts: {
    consolidatedResults: number;
    consolidatedSummaries: number;
  };
  run: {
    runId: string | null;
    processed: number | null;
    skipped: number | null;
    error: string | null;
  };
};
