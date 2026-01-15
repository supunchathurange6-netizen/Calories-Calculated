import type { UserProfile, CalorieInfo, ActivityLevel, Goal } from './types';

const activityFactors: Record<ActivityLevel, number> = {
  low: 1.375,
  medium: 1.55,
  high: 1.725,
};

const goalAdjustments: Record<Goal, number> = {
  lose: -400,
  maintain: 0,
  gain: 400,
};

// Mifflin-St Jeor Equation
export function calculateBMR(profile: UserProfile): number {
  const { weight, height, age, gender } = profile;
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

export function calculateCalorieInfo(profile: UserProfile): CalorieInfo {
  const bmr = calculateBMR(profile);
  const tdee = bmr * activityFactors[profile.activityLevel];
  const targetCalories = Math.round((tdee + goalAdjustments[profile.goal]) / 10) * 10;

  // Macro split: 40% Carbs, 30% Protein, 30% Fat
  const targetCarbs = Math.round((targetCalories * 0.4) / 4);
  const targetProtein = Math.round((targetCalories * 0.3) / 4);
  const targetFat = Math.round((targetCalories * 0.3) / 9);
  
  return {
    bmr,
    tdee,
    targetCalories,
    targetProtein,
    targetCarbs,
    targetFat,
  };
}
