import { createOpenAI } from '@ai-sdk/openai';
import { AI_GRADING_MODEL } from '@/lib/constants';

/**
 * OpenAI provider for AI grading.
 * Uses OPENAI_API_KEY from environment.
 */
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? '',
});

/** Default model for grading */
export const gradingModel = openai(AI_GRADING_MODEL);
