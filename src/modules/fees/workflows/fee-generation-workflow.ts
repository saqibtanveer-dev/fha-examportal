import { task } from '@trigger.dev/sdk/v3';
import { runFeeGeneration } from './fee-generation-core';

type FeeGenerationPayload = {
  generatedForMonth: string;
  classId?: string;
  sectionId?: string;
  studentProfileIds?: string[];
  categoryIds?: string[];
  dueDate: string;
  academicSessionId: string;
  requestedByUserId: string;
  lockId: string;
};

export const feeGenerationWorkflow = task({
  id: 'fees-generation-workflow',
  run: async (payload: FeeGenerationPayload) => {
    return runFeeGeneration(payload);
  },
});
