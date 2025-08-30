import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export class StorageService {
  /**
   * Marks onboarding as completed
   */
  public async setOnboardingCompleted(): Promise<void> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  }

  /**
   * Checks if onboarding has been completed
   */
  public async isOnboardingCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return value === 'true';
    } catch (error) {
      console.error('Error reading onboarding status:', error);
      return false;
    }
  }

  /**
   * Clears onboarding completion status (useful for testing)
   */
  public async clearOnboardingStatus(): Promise<void> {
    try {
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    } catch (error) {
      console.error('Error clearing onboarding status:', error);
    }
  }
}

export const storage = new StorageService();
