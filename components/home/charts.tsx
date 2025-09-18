import React, { useMemo } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Container } from '~/components/Container';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

type MonthDatum = { month: string; collection: number; participants: number };
type MaterialDatum = { name: string; value: number; color: string };
type TrendDatum = { day: string; kg: number };

const monthlyDataStatic: MonthDatum[] = [
  { month: 'Jan', collection: 890, participants: 245 },
  { month: 'Fev', collection: 1156, participants: 289 },
  { month: 'Mar', collection: 1025, participants: 312 },
  { month: 'Abr', collection: 1367, participants: 356 },
  { month: 'Mai', collection: 1247, participants: 342 },
];

const materialDataStatic: MaterialDatum[] = [
  { name: 'Plástico', value: 37, color: '#10b981' },
  { name: 'Papel', value: 26, color: '#3b82f6' },
  { name: 'Metal', value: 22, color: '#8b5cf6' },
  { name: 'Vidro', value: 15, color: '#f59e0b' },
];

const weeklyTrendStatic: TrendDatum[] = [
  { day: 'Seg', kg: 45 },
  { day: 'Ter', kg: 52 },
  { day: 'Qua', kg: 48 },
  { day: 'Qui', kg: 61 },
  { day: 'Sex', kg: 55 },
  { day: 'Sáb', kg: 38 },
  { day: 'Dom', kg: 42 },
];

const Card: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({
  title,
  subtitle,
  children,
}) => (
  <View className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
    <Text className="mb-1 text-lg font-semibold text-gray-900">{title}</Text>
    {subtitle ? <Text className="mb-3 text-xs text-gray-500">{subtitle}</Text> : null}
    {children}
  </View>
);

const BarChart: React.FC<{
  data: MonthDatum[];
  maxCollection?: number;
  maxParticipants?: number;
}> = ({ data, maxCollection = 1500, maxParticipants = 400 }) => {
  const CHART_HEIGHT = isSmallScreen ? 140 : 180;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View>
      <View style={{ height: CHART_HEIGHT }} className="relative">
        {gridLines.map((p, i) => (
          <View
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: CHART_HEIGHT * p }}
          />
        ))}

        <View className="absolute inset-0 flex-row items-end justify-between px-1">
          {data.map((item, index) => {
            const h1 = Math.max(4, (item.collection / maxCollection) * CHART_HEIGHT);
            const h2 = Math.max(4, (item.participants / maxParticipants) * CHART_HEIGHT);
            return (
              <View key={index} className="items-center" style={{ width: isSmallScreen ? 30 : 36 }}>
                <View className="flex-row items-end" style={{ height: CHART_HEIGHT }}>
                  <LinearGradient
                    colors={['#34d399', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: 12,
                      height: h1,
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      marginRight: 4,
                    }}
                  />
                  <LinearGradient
                    colors={['#93c5fd', '#3b82f6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: 12,
                      height: h2,
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                    }}
                  />
                </View>
                <Text className="mt-2 text-center text-xs text-gray-600">{item.month}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View className={`mt-4 flex-row justify-center ${isSmallScreen ? 'space-x-3' : 'space-x-6'}`}>
        <View className="flex-row items-center rounded-full bg-green-50 px-2 py-1">
          <View className="mr-1 h-2 w-2 rounded-full bg-emerald-500" />
          <Text className="text-xs text-gray-700">Coleta (kg)</Text>
        </View>
        <View className="flex-row items-center rounded-full bg-blue-50 px-2 py-1">
          <View className="mr-1 h-2 w-2 rounded-full bg-blue-500" />
          <Text className="text-xs text-gray-700">Participantes</Text>
        </View>
      </View>
    </View>
  );
};

const PieChart: React.FC<{ data: MaterialDatum[] }> = ({ data }) => (
  <View className="items-center">
    <View
      className={`relative ${isSmallScreen ? 'h-28 w-28' : 'h-40 w-40'} mb-4 rounded-full border-8 border-gray-100`}>
      {data.map((item, index) => {
        const rotation = data.slice(0, index).reduce((acc, curr) => acc + curr.value, 0) * 3.6;
        const segmentRotation = item.value * 3.6;
        return (
          <View
            key={index}
            className="absolute inset-0"
            style={{ transform: [{ rotate: `${rotation}deg` }] }}>
            <View
              className="absolute left-1/2 top-0 h-full w-1/2 origin-left"
              style={{
                backgroundColor: item.color,
                transform: [{ rotate: `${segmentRotation}deg` }],
              }}
            />
          </View>
        );
      })}
      <View className="absolute inset-4 items-center justify-center rounded-full bg-white">
        <Text className="text-xs text-gray-500">Materiais</Text>
        <Text className="text-lg font-bold text-gray-800">100%</Text>
      </View>
    </View>
    <View className="mt-2 space-y-2">
      {data.map((item, index) => (
        <View key={index} className="flex-row items-center">
          <View className="mr-2 h-3 w-3 rounded-sm" style={{ backgroundColor: item.color }} />
          <Text className="text-sm text-gray-700">
            {item.name}: {item.value}%
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const LineChart: React.FC<{ data: TrendDatum[] }> = ({ data }) => {
  const CHART_HEIGHT = isSmallScreen ? 120 : 160;
  const maxKg = Math.max(...data.map((d) => d.kg), 1);
  return (
    <View>
      <View style={{ height: CHART_HEIGHT }} className="relative">
        {[0, 0.5, 1].map((p, i) => (
          <View
            key={i}
            className="absolute left-0 right-0 border-t border-gray-200"
            style={{ top: CHART_HEIGHT * p }}
          />
        ))}
        <View className="absolute inset-0 flex-row items-end justify-between px-2">
          {data.map((item, idx) => {
            const h = Math.max(2, (item.kg / maxKg) * CHART_HEIGHT);
            return (
              <View key={idx} className="items-center" style={{ width: isSmallScreen ? 26 : 34 }}>
                <LinearGradient
                  colors={['#86efac', '#22c55e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ width: 8, height: h, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
                />
                <Text className="mt-2 text-xs text-gray-600">{item.day}</Text>
              </View>
            );
          })}
        </View>
      </View>
      <View className="mt-3 flex-row justify-center">
        <Text className="text-xs text-gray-600">Tendência semanal de coleta</Text>
      </View>
    </View>
  );
};

export default function Charts() {
  const headerStats = useMemo(() => {
    const totalKg = monthlyDataStatic.reduce((sum, d) => sum + d.collection, 0);
    const totalUsers = monthlyDataStatic.reduce((sum, d) => sum + d.participants, 0);
    const growth = Math.round(
      ((monthlyDataStatic[monthlyDataStatic.length - 1].collection -
        monthlyDataStatic[0].collection) /
        monthlyDataStatic[0].collection) *
        100
    );
    return { totalKg, totalUsers, growth };
  }, []);

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="mb-6 flex-row">
            <View className="mr-2 flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="leaf" size={16} color="#059669" />
                <Text className="ml-2 text-xs font-medium text-gray-500">Coleta total (YTD)</Text>
              </View>
              <Text
                className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} font-extrabold text-gray-900`}>
                {headerStats.totalKg} kg
              </Text>
            </View>
            <View className="mx-1 flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="people" size={16} color="#2563eb" />
                <Text className="ml-2 text-xs font-medium text-gray-500">Participantes</Text>
              </View>
              <Text
                className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} font-extrabold text-gray-900`}>
                {headerStats.totalUsers}
              </Text>
            </View>
            <View className="ml-2 flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-2 flex-row items-center">
                <Ionicons name="trending-up" size={16} color="#16a34a" />
                <Text className="ml-2 text-xs font-medium text-gray-500">Crescimento</Text>
              </View>
              <Text
                className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} font-extrabold ${headerStats.growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {headerStats.growth}%
              </Text>
            </View>
          </View>

          <View className="space-y-6">
            <Card title="Evolução Mensal" subtitle="Coleta x Participantes">
              <BarChart data={monthlyDataStatic} />
            </Card>

            <Card title="Distribuição por Material" subtitle="Percentual do total coletado">
              <PieChart data={materialDataStatic} />
            </Card>

            <Card title="Tendência Semanal" subtitle="Coleta por dia">
              <LineChart data={weeklyTrendStatic} />
            </Card>

            <Card title="Participação por Mês" subtitle="Comparativo inverso">
              <BarChart
                data={monthlyDataStatic.map((item) => ({
                  ...item,
                  collection: item.participants,
                  participants: item.collection,
                }))}
              />
            </Card>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
