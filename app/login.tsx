import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore } from '~/store/store';
import { validateLoginCredentials, type LoginCredentials } from '~/lib/validation';
import { APIError, APIValidationError } from '~/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { storage } from '~/lib/storage';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof LoginCredentials, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa erro específico quando usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async () => {
    // Validação local
    const validation = validateLoginCredentials(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    try {
      await login(formData.username, formData.password);
      // Mark onboarding as completed after successful authentication
      await storage.setOnboardingCompleted();
      // Redireciona para tela principal após login bem-sucedido
      router.replace('/(drawer)');
    } catch (error) {
      if (error instanceof APIValidationError) {
        // Trata erros de validação da API
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = messages[0]; // Pega primeira mensagem de erro
        });
        setErrors(apiErrors);
      } else if (error instanceof APIError) {
        Alert.alert('Erro de Login', error.message);
      } else {
        Alert.alert('Erro', 'Ocorreu um erro inesperado. Tente novamente.');
      }
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
            <Text className="text-lg text-green-100">Faça login em sua conta</Text>
          </View>

          {/* Card de Login */}
          <View className="rounded-lg bg-white/95 p-6 shadow-xl">
            <View className="mb-6">
              <Text className="text-center text-2xl font-bold text-green-800">
                Bem-vindo de volta!
              </Text>
              <Text className="mt-2 text-center text-gray-600">
                Entre com suas credenciais para continuar
              </Text>
            </View>

            {/* Campo Usuário */}
            <View className="mb-4">
              <Text className="mb-2 font-medium text-gray-700">Usuário</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Nome de usuário"
                  value={formData.username}
                  onChangeText={(text) => handleInputChange('username', text)}
                  className={`rounded-lg border py-3 pl-10 pr-4 text-base ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.username && (
                <Text className="mt-1 text-sm text-red-500">{errors.username}</Text>
              )}
            </View>

            {/* Campo Senha */}
            <View className="mb-2">
              <Text className="mb-2 font-medium text-gray-700">Senha</Text>
              <View className="relative">
                <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                </View>
                <TextInput
                  placeholder="Digite sua senha"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry={!showPassword}
                  className={`rounded-lg border py-3 pl-10 pr-10 text-base ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="mt-1 text-sm text-red-500">{errors.password}</Text>
              )}
            </View>

            {/* Exibe erros gerais da API */}
            {errors.non_field_errors && (
              <View className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
                <Text className="text-red-700">{errors.non_field_errors}</Text>
              </View>
            )}

            {/* Link Esqueceu a senha */}
            <View className="mb-7">
              <TouchableOpacity>
                <Text className="text-right font-medium text-green-600">Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            {/* Botão de Login */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className={`items-center justify-center rounded-lg py-3 ${
                isLoading ? 'bg-green-400' : 'bg-green-600'
              }`}>
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-base font-medium text-white">Entrar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
