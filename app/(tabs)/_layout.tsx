import { Tabs } from 'expo-router';
import { TabBarIcon } from '~/components/TabBarIcon';
import { AuthGuard } from '~/components/AuthGuard';
import { usePermissions } from '~/lib/hooks/usePermissions';

export default function TabLayout() {
  const { isStudent } = usePermissions();

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'green',
          headerTitleAlign: 'center',
          tabBarStyle: isStudent() ? { display: 'none' } : {},
        }}>
        <Tabs.Screen
          name="index"
          options={{
            headerShadowVisible: false,
            title: 'Ser Recicla',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="institutional"
          options={{
            headerShadowVisible: false,
            title: 'Usuários',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} size={23} />,
            href: isStudent() ? null : '/institutional',
          }}
        />
        <Tabs.Screen
          name="donations"
          options={{
            title: 'Doações',
            tabBarIcon: ({ color }) => <TabBarIcon name="gift" color={color} />,
            href: isStudent() ? null : '/donations',
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
