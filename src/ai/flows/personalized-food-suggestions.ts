'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing personalized food suggestions to users, 
 * incorporating dietary goals, preferences, and a mix of Sri Lankan and international cuisine.
 *
 * @exports personalizedFoodSuggestions - The main function to get personalized food suggestions.
 * @exports PersonalizedFoodSuggestionsInput - The input type for the personalizedFoodSuggestions function.
 * @exports PersonalizedFoodSuggestionsOutput - The output type for the personalizedFoodSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedFoodSuggestionsInputSchema = z.object({
  dietaryGoals: z
    .string()
    .describe('The user\'s dietary goals, e.g., weight loss, weight gain, maintain weight.'),
  foodPreferences: z
    .string()
    .describe('The user\'s food preferences, e.g., vegetarian, non-vegetarian, specific cuisines.'),
  cuisinePreference: z
    .string()
    .describe('The user\'s preferred cuisine, e.g., Sri Lankan, Indian, Italian.'),
});
export type PersonalizedFoodSuggestionsInput = z.infer<
  typeof PersonalizedFoodSuggestionsInputSchema
>;

const PersonalizedFoodSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of personalized food suggestions.'),
});
export type PersonalizedFoodSuggestionsOutput = z.infer<
  typeof PersonalizedFoodSuggestionsOutputSchema
>;

export async function personalizedFoodSuggestions(
  input: PersonalizedFoodSuggestionsInput
): Promise<PersonalizedFoodSuggestionsOutput> {
  return personalizedFoodSuggestionsFlow(input);
}

const personalizedFoodSuggestionsPrompt = ai.definePrompt({
  name: 'personalizedFoodSuggestionsPrompt',
  input: {schema: PersonalizedFoodSuggestionsInputSchema},
  output: {schema: PersonalizedFoodSuggestionsOutputSchema},
  prompt: `You are a helpful assistant that provides personalized food suggestions based on user dietary goals and food preferences.

  The user has the following dietary goals: {{dietaryGoals}}
  The user has the following food preferences: {{foodPreferences}}
  The user has the following cuisine preference: {{cuisinePreference}}

  Suggest a variety of foods, including both Sri Lankan dishes and international options.
  Return the suggestions as a JSON array of strings.
  Do not include any intro or explanation, just return a json array of strings.
  Example: ["Rice and Curry", "Kottu", "Pasta", "Pizza"]
  `, // MUST be a valid JSON array of strings
});

const personalizedFoodSuggestionsFlow = ai.defineFlow(
  {
    name: 'personalizedFoodSuggestionsFlow',
    inputSchema: PersonalizedFoodSuggestionsInputSchema,
    outputSchema: PersonalizedFoodSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await personalizedFoodSuggestionsPrompt(input);
    return output!;
  }
);
