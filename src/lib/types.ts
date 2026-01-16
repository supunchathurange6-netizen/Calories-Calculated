import { Timestamp } from 'firebase/firestore';

export type ActivityLevel = 'low' | 'medium' | 'high';
export type Goal = 'lose' | 'maintain' | 'gain';
export type Gender = 'male' | 'female';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  goal: Goal;
  createdAt: Timestamp;
}

export interface CalorieInfo {
  bmr: number;
  tdee: number;
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
}

export interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize?: string;
  isCustom?: boolean;
}

export interface LoggedFood extends Food {
  id: string; // Firestore document ID
  mealType: MealType;
  timestamp: Timestamp;
  servings: number;
  userProfileId: string;
}

export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight: number;
}
