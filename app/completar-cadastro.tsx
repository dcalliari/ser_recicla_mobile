import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { APIError, APIValidationError } from '~/lib/api';
import { useAuthStore } from '~/store/store';
import { validateFinalizarCadastroCredentials } from '~/lib/validation';
import { auth } from '~/lib/auth';

interface FinalizarCadastroData {
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
}

export default function CompletarCadastroScreen() {
  const {
    matricula: matriculaParam,
    turma: turmaParam,
    curso: cursoParam,
    unidade: unidadeParam,
    universidade: universidadeParam,
    user_id: userIdParam,
  } = useLocalSearchParams<{
    matricula: string;
    turma?: string;
    curso?: string;
    unidade?: string;
    universidade?: string;
    user_id?: string;
  }>();
  const { checkAuth } = useAuthStore();

  const [formData, setFormData] = useState<FinalizarCadastroData>({
    matricula: matriculaParam || '',
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof FinalizarCadastroData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpa erro específico quando usuário começa a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const validation = validateFinalizarCadastroCredentials(formData);
    setErrors(validation.errors);
    return validation.isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        user_id: userIdParam || '',
        matricula: formData.matricula,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        password_confirm: formData.password_confirm,
      };
      console.log('Submitting payload:', payload);
      await auth.finalizarCadastro(payload);

      // Update auth store
      await checkAuth();

      // Navigate to main app
      router.replace('/(tabs)');

      Alert.alert('Sucesso', 'Cadastro completado com sucesso!');
    } catch (error) {
      if (error instanceof APIValidationError) {
        const apiErrors: Record<string, string> = {};
        Object.entries(error.errors).forEach(([field, messages]) => {
          apiErrors[field] = messages[0];
        });
        setErrors(apiErrors);
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
        className="flex-1">
        {/* Elementos decorativos de fundo */}
        <View className="absolute inset-0">
          <View className="absolute left-10 top-20 h-20 w-20 rounded-full bg-green-300/20" />
          <View className="absolute bottom-20 right-10 h-32 w-32 rounded-full bg-emerald-300/15" />
          <View className="absolute right-1/4 top-1/2 h-16 w-16 rounded-full bg-green-200/20" />
          <View className="absolute bottom-1/3 left-1/4 h-24 w-24 rounded-full bg-emerald-400/10" />
        </View>

        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
          <View className="px-6 py-8">
            {/* Logo e Título */}
            <View className="mb-8 items-center">
              <View className="mb-4 flex-row items-center space-x-2">
                <View className="m-2 h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
                  <Text className="text-xl font-bold text-green-600">SR</Text>
                </View>
                <Text className="text-3xl font-bold text-white">Ser Recicla</Text>
              </View>
              <Text className="text-lg text-green-100">Complete seu cadastro</Text>
            </View>

            {/* Card de Cadastro */}
            <View className="rounded-lg bg-white/95 p-6 shadow-xl">
              <View className="mb-6">
                <Text className="text-center text-2xl font-bold text-green-800">
                  Finalizar Cadastro
                </Text>
                <Text className="mt-2 text-center text-gray-600">
                  Preencha os dados abaixo para completar seu cadastro
                </Text>
              </View>

              {/* Campo Matrícula (readonly) */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">Matrícula</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="card-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    value={formData.matricula}
                    editable={false}
                    className="rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-base text-gray-600"
                  />
                </View>
              </View>

              {/* Informações da Matrícula */}
              {(turmaParam || cursoParam || unidadeParam || universidadeParam) && (
                <View className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                  <Text className="mb-2 text-sm font-medium text-green-800">
                    Informações da Matrícula
                  </Text>
                  {universidadeParam && (
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="business-outline" size={16} color="#059669" />
                      <Text className="ml-2 text-sm text-green-700">
                        Universidade: {universidadeParam}
                      </Text>
                    </View>
                  )}
                  {unidadeParam && (
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="library-outline" size={16} color="#059669" />
                      <Text className="ml-2 text-sm text-green-700">Unidade: {unidadeParam}</Text>
                    </View>
                  )}
                  {cursoParam && (
                    <View className="mb-1 flex-row items-center">
                      <Ionicons name="book-outline" size={16} color="#059669" />
                      <Text className="ml-2 text-sm text-green-700">Curso: {cursoParam}</Text>
                    </View>
                  )}
                  {turmaParam && (
                    <View className="flex-row items-center">
                      <Ionicons name="school-outline" size={16} color="#059669" />
                      <Text className="ml-2 text-sm text-green-700">Turma: {turmaParam}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Campo Nome */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">Nome</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Digite seu nome"
                    value={formData.first_name}
                    onChangeText={(text) => handleInputChange('first_name', text)}
                    className={`rounded-lg border py-3 pl-10 pr-4 text-base ${
                      errors.first_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoCapitalize="words"
                  />
                </View>
                {errors.first_name && (
                  <Text className="mt-1 text-sm text-red-500">{errors.first_name}</Text>
                )}
              </View>

              {/* Campo Sobrenome */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">Sobrenome</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Digite seu sobrenome"
                    value={formData.last_name}
                    onChangeText={(text) => handleInputChange('last_name', text)}
                    className={`rounded-lg border py-3 pl-10 pr-4 text-base ${
                      errors.last_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    autoCapitalize="words"
                  />
                </View>
                {errors.last_name && (
                  <Text className="mt-1 text-sm text-red-500">{errors.last_name}</Text>
                )}
              </View>

              {/* Campo E-mail */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">E-mail</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Digite seu e-mail"
                    value={formData.email}
                    onChangeText={(text) => handleInputChange('email', text)}
                    className={`rounded-lg border py-3 pl-10 pr-4 text-base ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {errors.email && <Text className="mt-1 text-sm text-red-500">{errors.email}</Text>}
              </View>

              {/* Campo Nome de Usuário */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">Nome de Usuário</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="at-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Digite seu nome de usuário"
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
              <View className="mb-4">
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

              {/* Campo Confirmar Senha */}
              <View className="mb-6">
                <Text className="mb-2 font-medium text-gray-700">Confirmar Senha</Text>
                <View className="relative">
                  <View className="absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                  </View>
                  <TextInput
                    placeholder="Confirme sua senha"
                    value={formData.password_confirm}
                    onChangeText={(text) => handleInputChange('password_confirm', text)}
                    secureTextEntry={!showConfirmPassword}
                    className={`rounded-lg border py-3 pl-10 pr-10 text-base ${
                      errors.password_confirm ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {errors.password_confirm && (
                  <Text className="mt-1 text-sm text-red-500">{errors.password_confirm}</Text>
                )}
              </View>

              {/* Botão Finalizar Cadastro */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className={`items-center justify-center rounded-lg py-3 ${
                  isLoading ? 'bg-green-400' : 'bg-green-600'
                }`}>
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-base font-medium text-white">Finalizar Cadastro</Text>
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
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}
