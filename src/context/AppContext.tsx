'use client';

import React, { createContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { calculateCalorieInfo } from '@/lib/calculations';
import type { UserProfile, CalorieInfo, Food, LoggedFood, MealType, WeightEntry } from '@/lib/types';
import { format } from 'date-fns';
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { collection, doc, addDoc, query, where, orderBy, Timestamp, setDoc, getDocs, limit } from 'firebase/firestore';
import { setDocumentNonBlocking, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { initiateAnonymousSignIn } from '@/firebase/non-blocking-login';
import { signOut as firebaseSignOut, User } from 'firebase/auth';

interface AppContextType {
  isInitialized: boolean;
  user: User | null;
  profile: UserProfile | null;
  calorieInfo: CalorieInfo | null;
  loggedFoods: LoggedFood[];
  customFoods: Food[];
  weightHistory: WeightEntry[];
  dailyTotals: { calories: number; protein: number; carbs: number; fat: number; };
  setProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  addFoodLog: (food: Food, mealType: MealType, servings: number) => void;
  removeFoodLog: (logId: string) => void;
  addCustomFood: (food: Omit<Food, 'id' | 'isCustom'>) => Promise<Food>;
  addWeightEntry: (weight: number) => void;
  signOut: () => void;
  checkIfNameExists: (name: string) => Promise<boolean>;
}

export const AppContext = createContext<AppContextType>({
  isInitialized: false,
  user: null,
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
  signOut: () => {},
  checkIfNameExists: async () => false,
});

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  // Anonymous sign-in for non-admin users
  useEffect(() => {
    if (!isUserLoading && !user && auth) {
      const isAdminLogin = window.location.pathname.startsWith('/admin');
      if (!isAdminLogin) {
        initiateAnonymousSignIn(auth);
      }
    }
  }, [isUserLoading, user, auth]);

  // Data fetching hooks
  const profileRef = useMemoFirebase(() => (user ? doc(firestore, 'users', user.uid) : null), [firestore, user]);
  const { data: profile, isLoading: isProfileLoading } = useDoc<UserProfile>(profileRef);

  const customFoodsQuery = useMemoFirebase(() => (user ? collection(firestore, 'users', user.uid, 'customFoods') : null), [firestore, user]);
  const { data: customFoods } = useCollection<Food>(customFoodsQuery);
  
  const weightHistoryQuery = useMemoFirebase(() => (user ? query(collection(firestore, 'users', user.uid, 'weightHistory'), orderBy('date', 'asc')) : null), [firestore, user]);
  const { data: weightHistory } = useCollection<WeightEntry>(weightHistoryQuery);

  const todayStart = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(start);
  }, []);

  const loggedFoodsQuery = useMemoFirebase(() => (user ? query(collection(firestore, 'users', user.uid, 'foodEntries'), where('timestamp', '>=', todayStart)) : null), [firestore, user, todayStart]);
  const { data: loggedFoods } = useCollection<LoggedFood>(loggedFoodsQuery);

  const isInitialized = useMemo(() => {
    if (isUserLoading) return false;
    if (user && isProfileLoading) return false;
    return true;
  }, [isUserLoading, user, isProfileLoading]);

  const calorieInfo = useMemo(() => {
    return profile ? calculateCalorieInfo(profile) : null;
  }, [profile]);

  const checkIfNameExists = useCallback(async (name: string): Promise<boolean> => {
    if (!user || !firestore) {
      return false; 
    }
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('name', '==', name), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return false; // Name does not exist.
    }
    // Name exists, check if it belongs to a different user.
    const foundDoc = querySnapshot.docs[0];
    return foundDoc.id !== user.uid;
  }, [user, firestore]);

  const setProfile = useCallback((newProfileData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    if (user) {
      const docRef = doc(firestore, 'users', user.uid);
      
      const dataToSet: Partial<UserProfile> & { id: string } = { ...newProfileData, id: user.uid };

      if (!profile) {
        dataToSet.createdAt = Timestamp.now();
      }

      setDocumentNonBlocking(docRef, dataToSet, { merge: true });
    }
  }, [user, firestore, profile]);

  const addFoodLog = useCallback((food: Food, mealType: MealType, servings: number) => {
    if (user) {
      const newLog = {
        ...food,
        mealType,
        servings,
        timestamp: Timestamp.now(),
        userProfileId: user.uid,
      };
      addDocumentNonBlocking(collection(firestore, 'users', user.uid, 'foodEntries'), newLog);
    }
  }, [user, firestore]);

  const removeFoodLog = useCallback((logId: string) => {
    if (user) {
      deleteDocumentNonBlocking(doc(firestore, 'users', user.uid, 'foodEntries', logId));
    }
  }, [user, firestore]);

  const addCustomFood = useCallback(async (foodData: Omit<Food, 'id' | 'isCustom'>): Promise<Food> => {
    if (!user) throw new Error("User not authenticated to add custom food.");
    
    const newFoodData: Omit<Food, 'id'> = {
      ...foodData,
      isCustom: true,
    };
    
    const docRef = await addDoc(collection(firestore, 'users', user.uid, 'customFoods'), newFoodData);
    
    return { ...newFoodData, id: docRef.id };
  }, [user, firestore]);

  const addWeightEntry = useCallback((weight: number) => {
    if (user) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const newEntry: WeightEntry = { date: today, weight };
      setDocumentNonBlocking(doc(firestore, 'users', user.uid, 'weightHistory', today), newEntry, {});
    }
  }, [user, firestore]);

  const signOut = useCallback(() => {
    if (!auth) return;
    firebaseSignOut(auth).catch((error) => {
        toast({
            variant: 'destructive',
            title: 'Sign Out Error',
            description: error.message || 'There was a problem signing out.',
        });
    });
  }, [toast, auth]);

  const dailyTotals = useMemo(() => {
    return (loggedFoods || []).reduce(
      (totals, food) => {
        const servings = food.servings || 1;
        totals.calories += (food.calories || 0) * servings;
        totals.protein += (food.protein || 0) * servings;
        totals.carbs += (food.carbs || 0) * servings;
        totals.fat += (food.fat || 0) * servings;
        return totals;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [loggedFoods]);

  const value = {
    isInitialized,
    user,
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
    signOut,
    checkIfNameExists,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
