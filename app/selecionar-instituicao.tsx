import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

interface InstitutionOption {
  curso: string;
  turma: string;
  unidade: string;
  universidade: string;
  user_id: number;
}

export default function SelecionarInstituicao() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const matricula = params.matricula as string;
  const opcoesString = params.opcoes as string;

  const [selectedOption, setSelectedOption] = useState<InstitutionOption | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  let opcoes: InstitutionOption[] = [];
  try {
    opcoes = JSON.parse(opcoesString);
  } catch (error) {
    Alert.alert('Erro', 'Erro ao carregar opções de instituição');
    router.back();
    return null;
  }

  const handleSelectOption = (option: InstitutionOption) => {
    setSelectedOption(option);
    setShowDropdown(false);
  };

  const handleContinue = async () => {
    if (!selectedOption) {
      Alert.alert('Seleção obrigatória', 'Por favor, selecione uma instituição para continuar.');
      return;
    }

    setIsLoading(true);

    try {
      // Navigate to completion screen with selected institution data
      router.push({
        pathname: '/completar-cadastro' as any,
        params: {
          matricula: matricula,
          turma: selectedOption.turma,
          curso: selectedOption.curso,
          unidade: selectedOption.unidade,
          universidade: selectedOption.universidade,
          user_id: selectedOption.user_id.toString(),
        },
      });
    } catch (error) {
      Alert.alert('Erro', 'Erro ao prosseguir com a seleção');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDropdownItem = ({ item }: { item: InstitutionOption }) => (
    <TouchableOpacity
      onPress={() => handleSelectOption(item)}
      className="border-b border-gray-200 px-4 py-3">
      <Text className="mb-1 font-medium text-gray-900">{item.universidade}</Text>
      <Text className="text-sm text-gray-600">Unidade: {item.unidade}</Text>
      <Text className="text-sm text-gray-600">Curso: {item.curso}</Text>
      <Text className="text-sm text-gray-600">Turma: {item.turma}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1" edges={['bottom', 'left', 'right']}>
      <LinearGradient
        colors={['#059669', '#10b981', '#059669']} // green-600, green-500, emerald-600
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 pb-32">
        {/* Elementos decorativos de fundo */}
        <View className="absolute inset-0">
          <View className="absolute left-10 top-20 h-20 w-20 rounded-full bg-green-300/20" />
          <View className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-emerald-300/15" />
          <View className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-green-200/20" />
          <View className="absolute bottom-1/3 left-1/4 h-24 w-24 rounded-full bg-emerald-400/10" />
        </View>

        <View className="flex-1 justify-center px-6">
          {/* Logo e Título */}
          <View className="mb-8 items-center">
            <View className="mb-4 flex-row items-center space-x-2">
              <View className="m-2 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                <Text className="text-xl font-bold text-green-600">SR</Text>
              </View>
              <Text className="text-3xl font-bold text-white">Ser Recicla</Text>
            </View>
            <Text className="text-lg text-green-100">Selecione sua instituição</Text>
          </View>

          {/* Card de Seleção */}
          <View className="rounded-lg bg-white/95 p-6 shadow-xl">
            <Text className="mb-4 text-center text-lg font-semibold text-gray-800">
              Sua matrícula está associada a múltiplas instituições
            </Text>

            {/* Dropdown de Seleção */}
            <View className="mb-6">
              <Text className="mb-2 font-medium text-gray-700">Instituição</Text>
              <TouchableOpacity onPress={() => setShowDropdown(true)} className="relative">
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="business-outline" size={20} color="#9CA3AF" />
                  </View>
                  <View className="rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10">
                    <Text
                      className={`text-base ${selectedOption ? 'text-gray-900' : 'text-gray-500'}`}>
                      {selectedOption
                        ? `${selectedOption.universidade} - ${selectedOption.unidade}`
                        : 'Selecione uma instituição'}
                    </Text>
                  </View>
                  <View className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Ionicons name="chevron-down-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Botão Continuar */}
            <TouchableOpacity
              onPress={handleContinue}
              disabled={isLoading || !selectedOption}
              className={`mb-4 items-center justify-center rounded-lg py-3 ${
                isLoading || !selectedOption ? 'bg-green-400' : 'bg-green-600'
              }`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-medium text-white">Continuar</Text>
              )}
            </TouchableOpacity>

            {/* Botão Voltar */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="items-center justify-center rounded-lg border border-gray-300 bg-white py-3">
              <Text className="text-base font-medium text-gray-700">Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Modal do Dropdown */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity
          className="flex-1 items-center justify-center bg-black/50"
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}>
          <TouchableOpacity className="mx-6 max-h-96 w-full rounded-lg bg-white" activeOpacity={1}>
            <View className="border-b border-gray-200 p-4">
              <Text className="text-lg font-semibold text-gray-900">Selecione uma instituição</Text>
            </View>
            <FlatList
              data={opcoes}
              keyExtractor={(item, index) => index.toString()}
              renderItem={renderDropdownItem}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: 300 }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
