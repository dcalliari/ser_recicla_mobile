import { Tabs } from 'expo-router';
import { TabBarIcon } from '~/components/TabBarIcon';
import { AuthGuard } from '~/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: true,
          tabBarShowLabel: false,
          tabBarActiveTintColor: 'green',
          headerTitleAlign: 'center',
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
          name="two"
          options={{
            title: 'Tab Two',
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
