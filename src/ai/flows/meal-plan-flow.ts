'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized meal plans.
 *
 * @exports generateMealPlan - The main function to get a personalized meal plan.
 * @exports GenerateMealPlanInput - The input type for the generateMealPlan function.
 * @exports GenerateMealPlanOutput - The output type for the generateMealPlan function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MealItemSchema = z.object({
  name: z.string().describe('Name of the food item.'),
  calories: z.number().describe('Estimated calories for the meal item.'),
});

const MealSchema = z.object({
  items: z.array(MealItemSchema).describe('List of food items for the meal.'),
  totalCalories: z.number().describe('Total estimated calories for the meal.'),
});

export const GenerateMealPlanOutputSchema = z.object({
  breakfast: MealSchema,
  lunch: MealSchema,
  dinner: MealSchema,
  snacks: MealSchema,
  totalCalories: z.number().describe('Total estimated calories for the entire day.'),
  notes: z.string().describe('Additional notes or advice about the meal plan.'),
});
export type GenerateMealPlanOutput = z.infer<typeof GenerateMealPlanOutputSchema>;

export const GenerateMealPlanInputSchema = z.object({
  goal: z.string().describe("The user's primary dietary goal (e.g., 'weight loss', 'weight gain', 'maintain weight')."),
  preferences: z.string().describe("User's food preferences (e.g., 'Sri Lankan food', 'vegetarian', 'high protein')."),
  targetCalories: z.number().describe('The target daily calorie intake for the user.'),
});
export type GenerateMealPlanInput = z.infer<typeof GenerateMealPlanInputSchema>;


export async function generateMealPlan(input: GenerateMealPlanInput): Promise<GenerateMealPlanOutput> {
    return mealPlanFlow(input);
}


const prompt = ai.definePrompt({
    name: 'mealPlanPrompt',
    input: { schema: GenerateMealPlanInputSchema },
    output: { schema: GenerateMealPlanOutputSchema },
    prompt: `You are an expert nutritionist specializing in creating personalized meal plans, with a deep knowledge of Sri Lankan cuisine.

    Create a one-day meal plan for a user with the following details:
    - Goal: {{{goal}}}
    - Preferences: {{{preferences}}}
    - Target Daily Calories: ~{{{targetCalories}}} kcal

    Instructions:
    1.  Design a balanced one-day meal plan (Breakfast, Lunch, Dinner, and Snacks).
    2.  Prioritize Sri Lankan dishes if requested, but also include healthy international options for variety.
    3.  The total calories for the day should be as close as possible to the user's target.
    4.  For each meal (Breakfast, Lunch, Dinner, Snacks), provide a list of food items and their estimated calories.
    5.  Calculate the total calories for each meal and for the entire day.
    6.  Include brief, helpful notes. For example, suggest drinking water, or tips for preparation.
    7.  Ensure the output is a valid JSON object that strictly adheres to the provided output schema. Do not include any text outside of the JSON object.
    `,
});


const mealPlanFlow = ai.defineFlow(
    {
        name: 'mealPlanFlow',
        inputSchema: GenerateMealPlanInputSchema,
        outputSchema: GenerateMealPlanOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        return output!;
    }
);
