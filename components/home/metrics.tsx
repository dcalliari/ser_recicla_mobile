import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Container } from '~/components/Container';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
}

const MetricCard = ({ title, value, description }: MetricCardProps) => (
  <View className="mb-3 rounded-lg border border-gray-100 bg-white p-3 shadow-sm">
    <Text className="mb-1 text-sm font-medium text-gray-600">{title}</Text>
    <Text className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} mb-1 font-bold text-green-600`}>
      {value}
    </Text>
    <Text className="text-xs text-gray-500">{description}</Text>
  </View>
);

const MaterialProgress = ({
  material,
  weight,
  percentage,
}: {
  material: string;
  weight: string;
  percentage: number;
}) => (
  <View className="mb-4">
    <View className="mb-2 flex-row justify-between">
      <Text className="text-sm font-medium">{material}</Text>
      <Text className="text-sm text-gray-600">{weight}</Text>
    </View>
    <View className="h-2 w-full rounded-full bg-gray-200">
      <View className="h-2 rounded-full bg-green-600" style={{ width: `${percentage}%` }}></View>
    </View>
  </View>
);

const GoalProgress = ({
  title,
  percentage,
  current,
  total,
}: {
  title: string;
  percentage: number;
  current: string;
  total: string;
}) => (
  <View className="mb-6">
    <View className="mb-2 flex-row justify-between">
      <Text className="text-sm font-medium">{title}</Text>
      <Text className="text-sm text-green-600">{percentage}%</Text>
    </View>
    <View className="mb-1 h-3 w-full rounded-full bg-gray-200">
      <View className="h-3 rounded-full bg-green-500" style={{ width: `${percentage}%` }}></View>
    </View>
    <Text className="text-xs text-gray-500">
      {current} de {total}
    </Text>
  </View>
);

export default function Metrics() {
  const metricsData = {
    monthly: {
      collection: '1,247 kg',
      participants: '342',
      collections: '89',
      average: '14.2 kg',
    },
    weekly: {
      collection: '287 kg',
      participants: '156',
      collections: '21',
      average: '13.7 kg',
    },
    daily: {
      collection: '45 kg',
      participants: '28',
      collections: '4',
      average: '11.3 kg',
    },
  };

  const materialData = [
    { material: 'Plástico', weight: '456 kg', percentage: 37 },
    { material: 'Papel', weight: '321 kg', percentage: 26 },
    { material: 'Metal', weight: '278 kg', percentage: 22 },
    { material: 'Vidro', weight: '192 kg', percentage: 15 },
  ];

  const goals = [
    {
      title: 'Meta Mensal',
      percentage: 83,
      current: '1,247 kg',
      total: '1,500 kg',
    },
    {
      title: 'Participação',
      percentage: 68,
      current: '342',
      total: '500 usuários',
    },
    {
      title: 'Engajamento Semanal',
      percentage: 92,
      current: '23',
      total: '25 coletas',
    },
  ];

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <Text
            className={`${isSmallScreen ? 'text-xl' : 'text-2xl'} mb-6 font-bold text-gray-900`}>
            Métricas
          </Text>

          {/* Default to monthly metrics */}
          <View className="mb-6">
            <MetricCard
              title="Total Coletado"
              value={metricsData.monthly.collection}
              description="Material reciclável"
            />
            <MetricCard
              title="Participantes"
              value={metricsData.monthly.participants}
              description="Usuários ativos"
            />
            <MetricCard
              title="Coletas Realizadas"
              value={metricsData.monthly.collections}
              description="Entregas registradas"
            />
            <MetricCard
              title="Média por Coleta"
              value={metricsData.monthly.average}
              description="Por entrega"
            />
          </View>

          {/* Material Types and Goals */}
          <View className="space-y-6">
            <View className="mb-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-green-800">Tipos de Material</Text>
              {materialData.map((item, index) => (
                <MaterialProgress key={index} {...item} />
              ))}
            </View>

            <View className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-green-800">Metas e Objetivos</Text>
              {goals.map((goal, index) => (
                <GoalProgress key={index} {...goal} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
