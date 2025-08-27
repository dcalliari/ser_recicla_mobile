import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Animated,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

// Dados das telas de onboarding
const onboardingData = [
  {
    id: '1',
    title: 'Bem-vindo ao Ser Recicla',
    description:
      'Sua jornada rumo a um mundo mais sustentável começa aqui. Descubra como transformar resíduos em oportunidades.',
    icon: 'leaf-outline',
    color: '#059669', // green-600
  },
  {
    id: '2',
    title: 'Coleta Inteligente',
    description:
      'Localize pontos de coleta próximos, agende retiradas e acompanhe o impacto positivo das suas ações.',
    icon: 'location-outline',
    color: '#10b981', // green-500
  },
  {
    id: '3',
    title: 'Recompensas por Reciclar',
    description:
      'Ganhe pontos a cada material reciclado e troque por prêmios incríveis. Fazer o bem nunca foi tão recompensador.',
    icon: 'gift-outline',
    color: '#34d399', // green-400
  },
  {
    id: '4',
    title: 'Comunidade Sustentável',
    description:
      'Conecte-se com outros recicladores, compartilhe dicas e construa uma rede de impacto positivo.',
    icon: 'people-outline',
    color: '#6ee7b7', // green-300
  },
];

interface OnboardingItemProps {
  item: (typeof onboardingData)[0];
  index: number;
}

const OnboardingItem: React.FC<OnboardingItemProps> = ({ item }) => {
  return (
    <View style={{ width: screenWidth }} className="flex-1 items-center justify-center px-8">
      {/* Ícone principal */}
      <View
        className="mb-8 h-32 w-32 items-center justify-center rounded-full shadow-lg"
        style={{ backgroundColor: `${item.color}20` }}>
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: item.color }}>
          <Ionicons name={item.icon as any} size={40} color="white" />
        </View>
      </View>

      {/* Título */}
      <Text className="mb-4 text-center text-3xl font-bold text-white">{item.title}</Text>

      {/* Descrição */}
      <Text className="text-center text-lg leading-6 text-green-100">{item.description}</Text>
    </View>
  );
};

interface PaginationProps {
  data: typeof onboardingData;
  scrollX: Animated.Value;
}

const Pagination: React.FC<PaginationProps> = ({ data, scrollX }) => {
  return (
    <View className="mb-8 flex-row justify-center">
      {data.map((_, index) => {
        const inputRange = [
          (index - 1) * screenWidth,
          index * screenWidth,
          (index + 1) * screenWidth,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 30, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            className="mx-1 h-3 rounded-full bg-white"
            style={{
              width: dotWidth,
              opacity,
            }}
          />
        );
      })}
    </View>
  );
};

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      // Última tela - ir para login
      router.replace('/login');
    }
  };

  const skipOnboarding = () => {
    router.replace('/login');
  };

  return (
    <LinearGradient
      colors={['#059669', '#10b981', '#34d399']} // green-600 to green-400
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1">
      <SafeAreaView className="flex-1">
        {/* Header com botão Skip */}
        <View className="mt-8 flex-row justify-end p-6">
          <TouchableOpacity
            onPress={skipOnboarding}
            className="rounded-full bg-white/20 px-4 py-2"
            disabled={currentIndex === onboardingData.length - 1}
            style={{ opacity: currentIndex === onboardingData.length - 1 ? 0 : 1 }}>
            <Text className="font-medium text-white">Pular</Text>
          </TouchableOpacity>
        </View>

        {/* Carousel de slides */}
        <View className="flex-1">
          <FlatList
            ref={slidesRef}
            data={onboardingData}
            renderItem={({ item, index }) => <OnboardingItem item={item} index={index} />}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={(item) => item.id}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
            })}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            scrollEventThrottle={32}
          />
        </View>

        {/* Footer com indicadores e botões */}
        <View className="px-6 pb-8">
          {/* Indicadores de página */}
          <Pagination data={onboardingData} scrollX={scrollX} />

          {/* Botão principal */}
          <TouchableOpacity onPress={goToNext} className="mt-6 rounded-lg bg-white py-4">
            <Text className="text-center text-lg font-semibold text-green-600">
              {currentIndex === onboardingData.length - 1 ? 'Começar' : 'Continuar'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
