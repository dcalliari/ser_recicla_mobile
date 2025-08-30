import { useState } from 'react';
import { Dimensions } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import Overview from '~/components/home/overview';
import Metrics from '~/components/home/metrics';
import Charts from '~/components/home/charts';
import Profile from '~/components/home/profile';

const renderScene = SceneMap({
  first: Overview,
  second: Metrics,
  third: Charts,
  fourth: Profile,
});

const initialLayout = { width: Dimensions.get('window').width };

export default function Home() {
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Geral' },
    { key: 'second', title: 'Métricas' },
    { key: 'third', title: 'Gráficos' },
    { key: 'fourth', title: 'Perfil' },
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
