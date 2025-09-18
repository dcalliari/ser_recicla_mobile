import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';

import Users from '~/components/institutional/users';
import { usePermissions } from '~/lib/hooks/usePermissions';

export default function Institutional() {
  const { isStudent, canAccessInstitutional } = usePermissions();

  useEffect(() => {
    // Redireciona alunos para a home page
    if (isStudent()) {
      router.replace('/(tabs)');
    }
  }, [isStudent]);

  // Se não tiver acesso, não renderiza nada (já está sendo redirecionado)
  if (!canAccessInstitutional()) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Acesso restrito</Text>
      </View>
    );
  }

  return (
    <>
      <Users />
    </>
  );
}
