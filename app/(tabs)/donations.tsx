import { Text, View } from 'react-native';
import { useEffect } from 'react';
import { router } from 'expo-router';
import { usePermissions } from '~/lib/hooks/usePermissions';

export default function Donations() {
  const { isStudent, canAccessDonations } = usePermissions();

  useEffect(() => {
    // Redireciona alunos para a home page
    if (isStudent()) {
      router.replace('/(tabs)');
    }
  }, [isStudent]);

  // Se não tiver acesso, não renderiza nada (já está sendo redirecionado)
  if (!canAccessDonations()) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-lg">Acesso restrito</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-lg">Doações</Text>
    </View>
  );
}
