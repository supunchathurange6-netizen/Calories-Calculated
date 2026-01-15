'use client';

import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateCalorieInfo } from '@/lib/calculations';
import type { UserProfile, CalorieInfo, Food, LoggedFood, MealType, WeightEntry } from '@/lib/types';
import { format } from 'date-fns';

interface AppContextType {
  isInitialized: boolean;
  profile: UserProfile | null;
  calorieInfo: CalorieInfo | null;
  loggedFoods: LoggedFood[];
  customFoods: Food[];
  weightHistory: WeightEntry[];
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number; };
  setProfile: (profile: UserProfile) => void;
  addFoodLog: (food: Food, mealType: MealType, servings: number) => void;
  removeFoodLog: (logId: string) => void;
  addCustomFood: (food: Omit<Food, 'id' | 'isCustom'>) => Food;
  addWeightEntry: (weight: number) => void;
}

export const AppContext = createContext<AppContextType>({
  isInitialized: false,
  profile: null,
  calorieInfo: null,
  loggedFoods: [],
  customFoods: [],
  weightHistory: [],
  dailyTotals: { calories: 0, protein: 0, carbs: 0, fat: 0 },
  setProfile: () => {},
  addFoodLog: () => {},
  removeFoodLog: () => {},
  addCustomFood: () => ({} as Food),
  addWeightEntry: () => {},
});

// Custom hook for localStorage
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Handle cases where item might be "undefined" or null
      if (item && item !== 'undefined') {
        return JSON.parse(item);
      }
      return initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        if (value === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}


export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [profile, setProfileState] = useLocalStorage<UserProfile | null>('userProfile', null);
  const [calorieInfo, setCalorieInfo] = useLocalStorage<CalorieInfo | null>('calorieInfo', null);
  const [loggedFoods, setLoggedFoods] = useLocalStorage<LoggedFood[]>('loggedFoods', []);
  const [customFoods, setCustomFoods] = useLocalStorage<Food[]>('customFoods', []);
  const [weightHistory, setWeightHistory] = useLocalStorage<WeightEntry[]>('weightHistory', []);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const setProfile = useCallback((newProfile: UserProfile) => {
    setProfileState(newProfile);
    const newCalorieInfo = calculateCalorieInfo(newProfile);
    setCalorieInfo(newCalorieInfo);
  }, [setProfileState, setCalorieInfo]);

  const addFoodLog = useCallback((food: Food, mealType: MealType, servings: number) => {
    const newLog: LoggedFood = {
      ...food,
      logId: `log_${new Date().getTime()}`,
      mealType,
      servings,
      timestamp: new Date().getTime(),
    };
    setLoggedFoods(prev => [newLog, ...prev]);
  }, [setLoggedFoods]);

  const removeFoodLog = useCallback((logId: string) => {
    setLoggedFoods(prev => prev.filter(log => log.logId !== logId));
  }, [setLoggedFoods]);
  
  const addCustomFood = useCallback((foodData: Omit<Food, 'id' | 'isCustom'>): Food => {
    const newFood: Food = {
      ...foodData,
      id: `custom_${new Date().getTime()}`,
      isCustom: true,
    };
    setCustomFoods(prev => [newFood, ...prev]);
    return newFood;
  }, [setCustomFoods]);

  const addWeightEntry = useCallback((weight: number) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const newEntry: WeightEntry = { date: today, weight };

    setWeightHistory(prev => {
        const existingEntryIndex = prev.findIndex(entry => entry.date === today);
        if (existingEntryIndex > -1) {
            const updatedHistory = [...prev];
            updatedHistory[existingEntryIndex] = newEntry;
            return updatedHistory;
        }
        return [...prev, newEntry];
    });
  }, [setWeightHistory]);

  const dailyTotals = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return loggedFoods
      .filter(food => new Date(food.timestamp) >= today)
      .reduce(
        (totals, food) => {
          totals.calories += food.calories * food.servings;
          totals.protein += food.protein * food.servings;
          totals.carbs += food.carbs * food.servings;
          totals.fat += food.fat * food.servings;
          return totals;
        },
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );
  }, [loggedFoods]);

  useEffect(() => {
    // Clear logs daily
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const midnight = new Date(today);
    midnight.setDate(midnight.getDate() + 1);
    
    const timeToMidnight = midnight.getTime() - new Date().getTime();
    
    const timeoutId = setTimeout(() => {
      setLoggedFoods([]);
    }, timeToMidnight);

    return () => clearTimeout(timeoutId);
  }, [loggedFoods, setLoggedFoods]);


  const value = {
    isInitialized,
    profile,
    calorieInfo,
    loggedFoods,
    customFoods,
    weightHistory,
    dailyTotals,
    setProfile,
    addFoodLog,
    removeFoodLog,
    addCustomFood,
    addWeightEntry,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
