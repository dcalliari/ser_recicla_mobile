import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { storage } from '~/lib/storage';

export default function Index() {
  const { isAuthenticated, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if onboarding is completed
        const onboardingCompleted = await storage.isOnboardingCompleted();

        if (!onboardingCompleted) {
          // Show onboarding
          router.replace('/onboarding');
          return;
        }

        // Onboarding completed, check authentication
        await checkAuth();

        // If authenticated, go to tabs, otherwise go to login
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Error initializing app:', error);
        // Fallback to login
        router.replace('/login');
      } finally {
        setIsChecking(false);
      }
    };

    initializeApp();
  }, [checkAuth, isAuthenticated]);

  if (isChecking) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  return null;
}
