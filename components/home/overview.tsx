import React from 'react';
import { View, Text, ScrollView, Dimensions, type StyleProp, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '~/components/Container';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;
const isTablet = width >= 768;

interface OverviewCardProps {
  title: string;
  value: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const OverviewCard = ({
  title,
  value,
  description,
  icon,
  color,
  bgColor,
  containerStyle,
}: OverviewCardProps) => (
  <View
    className={`rounded-xl bg-white ${isTablet ? 'p-5' : 'p-4'} border border-gray-100 shadow-sm`}
    style={containerStyle}>
    <View className="mb-2 flex-row items-center justify-between">
      <Text className={`text-sm font-medium text-gray-600 ${isSmallScreen ? 'flex-1' : ''}`}>
        {title}
      </Text>
      <View className={`rounded-full p-2 ${bgColor}`}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
    </View>
    <Text
      className={`${isSmallScreen ? 'text-2xl' : 'text-2xl'} mb-1 font-extrabold text-gray-900`}>
      {value}
    </Text>
    <Text className="text-xs text-gray-500">{description}</Text>
  </View>
);

const ActivityItem = ({
  icon,
  title,
  subtitle,
  time,
}: {
  icon: string;
  title: string;
  subtitle: string;
  time: string;
}) => (
  <View className="flex-row items-center border-b border-gray-100 py-3">
    <View className="mr-3 h-2 w-2 rounded-full bg-green-500"></View>
    <View className="flex-1">
      <Text className="text-sm font-medium text-gray-900">{title}</Text>
      <Text className="text-xs text-gray-500">{subtitle}</Text>
    </View>
    <Text className="text-xs text-gray-400">{time}</Text>
  </View>
);

const RankingItem = ({
  rank,
  name,
  points,
  weight,
}: {
  rank: number;
  name: string;
  points: string;
  weight: string;
}) => (
  <View className="flex-row items-center justify-between py-2">
    <View className="flex-1 flex-row items-center">
      <View
        className={`mr-3 h-6 w-6 items-center justify-center rounded-full ${
          rank === 1
            ? 'bg-yellow-200'
            : rank === 2
              ? 'bg-gray-200'
              : rank === 3
                ? 'bg-orange-200'
                : 'bg-green-100'
        }`}>
        <Text className="text-xs font-bold text-gray-700">{rank}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-900">{name}</Text>
        <Text className="text-xs text-gray-500">{weight}</Text>
      </View>
    </View>
    <Text className="text-sm font-bold text-green-600">{points}</Text>
  </View>
);

export default function Overview() {
  const overviewCards = [
    {
      title: 'Total Coletado',
      value: '1,247 kg',
      description: 'Este mês',
      icon: 'leaf' as keyof typeof Ionicons.glyphMap,
      color: '#059669',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Participantes Ativos',
      value: '342',
      description: 'Usuários engajados',
      icon: 'people' as keyof typeof Ionicons.glyphMap,
      color: '#2563eb',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Universidades',
      value: '12',
      description: 'Cadastradas',
      icon: 'school' as keyof typeof Ionicons.glyphMap,
      color: '#7c3aed',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Pontos de Coleta',
      value: '45',
      description: 'Ativos',
      icon: 'location' as keyof typeof Ionicons.glyphMap,
      color: '#ea580c',
      bgColor: 'bg-orange-100',
    },
  ];

  const recentActivities = [
    {
      icon: 'checkmark-circle',
      title: 'Nova coleta registrada',
      subtitle: 'Turma Engenharia A - 15.2kg',
      time: '2h atrás',
    },
    {
      icon: 'person-add',
      title: 'Novo usuário cadastrado',
      subtitle: 'João Silva - Aluno',
      time: '4h atrás',
    },
    {
      icon: 'trophy',
      title: 'Meta mensal alcançada',
      subtitle: 'Turma Direito B - 100kg',
      time: '1d atrás',
    },
  ];

  const rankings = [
    { name: 'Engenharia Ambiental A', points: '245 pts', weight: '89.2kg' },
    { name: 'Biologia Marinha', points: '198 pts', weight: '67.8kg' },
    { name: 'Direito Ambiental', points: '176 pts', weight: '58.8kg' },
    { name: 'Arquitetura Verde', points: '142 pts', weight: '45.9kg' },
    { name: 'Gestão Sustentável', points: '128 pts', weight: '41.2kg' },
  ];

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-2">
          <Text
            className={`${isSmallScreen ? 'text-2xl' : 'text-3xl'} mb-4 font-extrabold text-gray-900`}>
            Visão Geral
          </Text>

          {/* Overview Cards - responsive 1/2-column grid without gap prop */}
          <View className="mb-6 flex-row flex-wrap">
            {overviewCards.map((card, index) => {
              const twoColumns = !isSmallScreen; // 1 col on very small screens, 2 cols otherwise
              const isLeft = index % 2 === 0;
              const containerStyle: ViewStyle = {
                width: twoColumns ? '48%' : '100%',
                marginRight: twoColumns && isLeft ? 12 : 0,
                marginBottom: 12,
              };
              return <OverviewCard key={index} {...card} containerStyle={containerStyle} />;
            })}
          </View>

          {/* Recent Activity and Ranking */}
          <View className={isTablet ? 'flex-row space-x-3' : 'space-y-3'}>
            {/* Recent Activity */}
            <View className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-2 text-lg font-semibold text-green-800">Atividade Recente</Text>
              <Text className="mb-4 text-sm text-gray-600">Últimas ações no sistema</Text>
              <View>
                {recentActivities.map((activity, index) => (
                  <ActivityItem key={index} {...activity} />
                ))}
              </View>
            </View>

            {/* Ranking */}
            <View className="flex-1 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-2 text-lg font-semibold text-green-800">Ranking Mensal</Text>
              <Text className="mb-4 text-sm text-gray-600">Top 5 turmas mais engajadas</Text>
              <View>
                {rankings.map((item, index) => (
                  <RankingItem key={index} rank={index + 1} {...item} />
                ))}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
