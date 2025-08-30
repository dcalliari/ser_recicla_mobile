import { useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Container } from '~/components/Container';
import { useAuthStore } from '~/store/store';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
            router.replace('/login' as any);
          } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails, redirect to login
            router.replace('/login' as any);
          }
        },
      },
    ]);
  };

  return (
    <>
      <Container>
        <View className="flex-1 items-center justify-center p-4">
          <View className="mb-8 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Ionicons name="person" size={40} color="#059669" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">
              Bem-vindo, {user?.username || 'Usuário'}!
            </Text>
            <Text className="mt-2 text-lg text-gray-600">{user?.email}</Text>
            <Text className="mt-1 text-base text-gray-500">Perfil: {user?.role || 'N/A'}</Text>
          </View>

          <View className="w-full rounded-lg bg-white p-6 shadow-lg">
            <Text className="mb-4 text-lg font-semibold text-gray-800">Informações da Conta</Text>

            <View className="space-y-3">
              <View className="flex-row justify-between">
                <Text className="text-gray-600">ID:</Text>
                <Text className="font-medium">{user?.id}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Universidade:</Text>
                <Text className="font-medium">{user?.universidade || 'N/A'}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Unidade:</Text>
                <Text className="font-medium">{user?.unidade || 'N/A'}</Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Turma:</Text>
                <Text className="font-medium">{user?.turma || 'N/A'}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity onPress={handleLogout} className="mt-8 rounded-lg bg-red-600 px-6 py-3">
            <Text className="font-medium text-white">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </Container>
    </>
  );
}
