import { SafeAreaView } from 'react-native';

export const Container = ({ children }: { children: React.ReactNode }) => {
  return <SafeAreaView className={styles.container}>{children}</SafeAreaView>;
};

const styles = {
  // Use padding instead of large margins to avoid cramping content on small screens
  container: 'flex flex-1 px-4 pt-3 pb-4',
};
