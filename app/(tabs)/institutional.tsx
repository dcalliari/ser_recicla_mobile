import { useState, useEffect } from 'react';
import { Dimensions, View, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { router } from 'expo-router';

import Users from '~/components/institutional/users';
import Classes from '~/components/institutional/classes';
import { usePermissions } from '~/lib/hooks/usePermissions';

const renderScene = SceneMap({
  first: Classes,
  second: Users,
});

const initialLayout = { width: Dimensions.get('window').width };

export default function Institutional() {
  const { isStudent, canAccessInstitutional } = usePermissions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Turmas' },
    { key: 'second', title: 'Usuários' },
  ]);

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
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={initialLayout}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: 'green' }}
            style={{ backgroundColor: 'white' }}
            activeColor="green"
            inactiveColor="gray"
            tabStyle={{ height: 40 }}
          />
        )}
      />
    </>
  );
}
