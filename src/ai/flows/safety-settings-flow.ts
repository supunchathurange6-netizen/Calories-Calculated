'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const harmCategories = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
] as const;

const thresholds = [
  'BLOCK_NONE',
  'BLOCK_ONLY_HIGH',
  'BLOCK_MEDIUM_AND_ABOVE',
  'BLOCK_LOW_AND_ABOVE',
] as const;

const HarmCategorySchema = z.enum(harmCategories);
const ThresholdSchema = z.enum(thresholds);

export const UpdateSafetySettingsInputSchema = z.object({
  settings: z.array(z.object({
    category: HarmCategorySchema,
    threshold: ThresholdSchema,
  }))
});
export type UpdateSafetySettingsInput = z.infer<typeof UpdateSafetySettingsInputSchema>;

export const UpdateSafetySettingsOutputSchema = z.object({
  status: z.string(),
});
export type UpdateSafetySettingsOutput = z.infer<typeof UpdateSafetySettingsOutputSchema>;

export async function updateSafetySettings(
  input: UpdateSafetySettingsInput
): Promise<UpdateSafetySettingsOutput> {
  return updateSafetySettingsFlow(input);
}

const updateSafetySettingsFlow = ai.defineFlow(
  {
    name: 'updateSafetySettingsFlow',
    inputSchema: UpdateSafetySettingsInputSchema,
    outputSchema: UpdateSafetySettingsOutputSchema,
  },
  async (input) => {
    // In a real application, you would save these settings to a secure location,
    // like a specific document in Firestore only accessible by admins.
    console.log('Received safety settings to update:', input);

    // For now, we'll just log and return a success message.
    // The settings would be applied in flows that call genkit's generate method.
    return {
      status: 'success',
    };
  }
);
