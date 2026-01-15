'use client';

import React, { createContext, useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateCalorieInfo } from '@/lib/calculations';
import type { UserProfile, CalorieInfo, Food, LoggedFood, MealType, WeightEntry } from '@/lib/types';
import { format } from 'date-fns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from '@/firebase';
import { collection, doc, setDoc, addDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { getAuth } from 'firebase/auth';

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
  addCustomFood: (food: Omit<Food, 'id' | 'isCustom'>) => Promise<Food>;
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
  addCustomFood: async () => ({} as Food),
  addWeightEntry: () => {},
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const profileRef = useMemoFirebase(() => user ? doc(firestore, 'users', user.uid) : null, [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);
  
  const customFoodsQuery = useMemoFirebase(() => user ? collection(firestore, 'users', user.uid, 'customFoods') : null, [firestore, user]);
  const { data: customFoods, isLoading: isCustomFoodsLoading } = useCollection<Food>(customFoodsQuery);

  const weightHistoryQuery = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'weightHistory'), orderBy('date', 'asc')) : null, [firestore, user]);
  const { data: weightHistory, isLoading: isWeightHistoryLoading } = useCollection<WeightEntry>(weightHistoryQuery);
  
  const todayStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(start);
  }, []);

  const loggedFoodsQuery = useMemoFirebase(() => user ? query(collection(firestore, 'users', user.uid, 'foodEntries'), where('timestamp', '>=', todayStart)) : null, [firestore, user]);
  const { data: loggedFoods, isLoading: isLoggedFoodsLoading } = useCollection<LoggedFood>(loggedFoodsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      initiateAnonymousSignIn(getAuth());
    }
  }, [isUserLoading, user]);

  const isInitialized = !isUserLoading && !isProfileLoading && !isCustomFoodsLoading && !isWeightHistoryLoading && !isLoggedFoodsLoading;

  const calorieInfo = useMemo(() => {
    if (profile) {
      return calculateCalorieInfo(profile);
    }
    return null;
  }, [profile]);
  
  const setProfile = useCallback((newProfileData: UserProfile) => {
    if (user) {
      const profileDataWithId = { ...newProfileData, id: user.uid };
      setDocumentNonBlocking(doc(firestore, 'users', user.uid), profileDataWithId, { merge: true });
    }
  }, [user, firestore]);

  const addFoodLog = useCallback((food: Food, mealType: MealType, servings: number) => {
    if (user) {
      const newLog = {
        ...food,
        mealType,
        servings,
        timestamp: Timestamp.now(),
        userProfileId: user.uid,
      };
      // No need for logId as firestore will generate one
      addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'foodEntries'), newLog);
    }
  }, [user, firestore]);

  const removeFoodLog = useCallback((logId: string) => {
    if (user) {
      deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'foodEntries', logId));
    }
  }, [user, firestore]);
  
  const addCustomFood = useCallback(async (foodData: Omit<Food, 'id' | 'isCustom'>): Promise<Food> => {
    if (user) {
        const newFood: Omit<Food, 'id'> = {
            ...foodData,
            isCustom: true,
        };
        const docRef = await addDoc(collection(firestore, 'users', user.uid, 'customFoods'), newFood);
        return { ...newFood, id: docRef.id };
    }
    throw new Error("User not authenticated");
  }, [user, firestore]);

  const addWeightEntry = useCallback((weight: number) => {
    if(user) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const newEntry: WeightEntry = { date: today, weight };
        const weightDocRef = doc(firestore, 'users', user.uid, 'weightHistory', today);
        setDocumentNonBlocking(weightDocRef, newEntry);
    }
  }, [user, firestore]);

  const dailyTotals = useMemo(() => {
    return (loggedFoods || []).reduce(
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

  const value = {
    isInitialized,
    profile: profile || null,
    calorieInfo,
    loggedFoods: loggedFoods || [],
    customFoods: customFoods || [],
    weightHistory: weightHistory || [],
    dailyTotals,
    setProfile,
    addFoodLog,
    removeFoodLog,
    addCustomFood,
    addWeightEntry,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
