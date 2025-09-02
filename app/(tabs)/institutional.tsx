import { useState } from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import Users from '~/components/institutional/users';
import Classes from '~/components/institutional/classes';

const renderScene = SceneMap({
  first: Classes,
  second: Users,
});

const initialLayout = { width: Dimensions.get('window').width };

export default function Institutional() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Turmas' },
    { key: 'second', title: 'Usuários' },
  ]);

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
