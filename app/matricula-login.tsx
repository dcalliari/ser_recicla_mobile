import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '~/lib/auth';
import { APIError, APIValidationError } from '~/lib/api';
import { validateMatriculaCredentials } from '~/lib/validation';

export default function MatriculaLoginScreen() {
  const [matricula, setMatricula] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // Validação local
    const validation = validateMatriculaCredentials({ matricula });
    if (!validation.isValid) {
      setError(validation.errors.matricula || 'Erro de validação');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await auth.validateMatricula(matricula.trim());

      if (response.valid) {
        // Navigate to completion screen with matricula and additional info
        router.push({
          pathname: '/completar-cadastro' as any,
          params: {
            matricula: matricula.trim(),
            turma: response.turma || '',
            curso: response.curso || '',
          },
        });
      } else {
        Alert.alert(
          'Matrícula Inválida',
          response.message || 'Matrícula não encontrada ou inválida'
        );
      }
    } catch (error) {
      if (error instanceof APIValidationError) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = (messages as string[])[0];
        });
        setError(apiErrors.matricula || 'Erro de validação');
      } else if (error instanceof APIError) {
        Alert.alert('Erro', error.message);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1">
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
            <Text className="text-lg text-green-100">Acesse com sua matrícula</Text>
          </View>

          {/* Card de Matrícula */}
          <View className="rounded-lg bg-white/95 p-6 shadow-xl">
            {/* Campo Matrícula */}
            <View className="mb-4">
              <View className="relative">
                <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                  <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Digite sua matrícula"
                  value={matricula}
                  onChangeText={(text) => {
                    setMatricula(text);
                    if (error) setError('');
                  }}
                  className={`rounded-lg border py-3 pl-10 pr-4 text-base ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
            </View>

            {/* Botão Validar */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`items-center justify-center rounded-lg py-3 ${
                isLoading ? 'bg-green-400' : 'bg-green-600'
              }`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-medium text-white">Validar Matrícula</Text>
              )}
            </TouchableOpacity>

            {/* Botão Voltar */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-4 items-center justify-center rounded-lg border border-gray-300 bg-white py-3">
              <Text className="text-base font-medium text-gray-700">Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
