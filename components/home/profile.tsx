import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container } from '~/components/Container';
import { useAuthStore } from '~/store/store';
import React, { useState } from 'react';
import { api } from '~/lib/api';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 380;

export default function Profile() {
  const { user, logout } = useAuthStore();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    unidade: user?.unidade || '',
    universidade: user?.universidade || '',
    turma: user?.turma || '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  // Two-factor auth state
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAQr, setTwoFAQr] = useState<string | null>(null);
  const [twoFACode, setTwoFACode] = useState('');

  const handleLogout = async () => {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handleSaveProfile = () => {
    // Mock save functionality
    Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    setEditMode(false);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }
    Alert.alert('Sucesso', 'Senha alterada com sucesso!');
    setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  // 2FA setup and management
  const handleEnable2FA = async () => {
    try {
      const setup = await api.post<{ qr: string; secret: string }>('/v1/auth/2fa/setup/');
      setTwoFAQr(setup.qr);
      // If needed in future: setup.secret
      Alert.alert('Quase lá', 'Escaneie o QR no seu app autenticador e insira o código.');
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar 2FA.');
    }
  };

  const handleConfirmEnable2FA = async () => {
    try {
      await api.post('/v1/auth/2fa/enable/', { otp_code: twoFACode });
      setTwoFAEnabled(true);
      setTwoFAQr(null);
      setTwoFACode('');
      Alert.alert('2FA Ativado', 'Autenticação de dois fatores ativada com sucesso.');
    } catch {
      Alert.alert('Código inválido', 'Confira o código e tente novamente.');
    }
  };

  const handleDisable2FA = async () => {
    Alert.alert('Desativar 2FA', 'Tem certeza que deseja desativar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desativar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.post('/v1/auth/2fa/disable/');
            setTwoFAEnabled(false);
            Alert.alert('2FA Desativado', 'Você poderá ativar novamente quando quiser.');
          } catch {
            Alert.alert('Erro', 'Não foi possível desativar o 2FA.');
          }
        },
      },
    ]);
  };

  return (
    <Container>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="space-y-6">
            {/* User Info Card */}
            <View className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-6 items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="person" size={32} color="#059669" />
                </View>
                <Text
                  className={`${isSmallScreen ? 'text-lg' : 'text-2xl'} font-bold text-gray-800`}>
                  {user?.username || 'Usuário'}
                </Text>
                <Text className="mt-2 text-base text-gray-600">{user?.email}</Text>
                <Text className="mt-1 text-sm text-gray-500">Perfil: {user?.role || 'N/A'}</Text>
              </View>

              {!editMode ? (
                <View className="space-y-3">
                  <View className="flex-row justify-between border-b border-gray-100 py-2">
                    <Text className="text-gray-600">ID:</Text>
                    <Text className="font-medium">{user?.id}</Text>
                  </View>
                  <View className="flex-row justify-between border-b border-gray-100 py-2">
                    <Text className="text-gray-600">Universidade:</Text>
                    <Text className="font-medium">{user?.universidade || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between border-b border-gray-100 py-2">
                    <Text className="text-gray-600">Unidade:</Text>
                    <Text className="font-medium">{user?.unidade || 'N/A'}</Text>
                  </View>
                  <View className="flex-row justify-between border-b border-gray-100 py-2">
                    <Text className="text-gray-600">Turma:</Text>
                    <Text className="font-medium">{user?.turma || 'N/A'}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setEditMode(true)}
                    className="mt-4 items-center rounded-lg bg-blue-600 py-3">
                    <Text className="font-medium text-white">Editar Perfil</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="space-y-4">
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">Nome de Usuário</Text>
                    <TextInput
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={formData.username}
                      onChangeText={(text) => setFormData({ ...formData, username: text })}
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">Email</Text>
                    <TextInput
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={formData.email}
                      onChangeText={(text) => setFormData({ ...formData, email: text })}
                      keyboardType="email-address"
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">Universidade</Text>
                    <TextInput
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={formData.universidade}
                      onChangeText={(text) => setFormData({ ...formData, universidade: text })}
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">Unidade</Text>
                    <TextInput
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={formData.unidade}
                      onChangeText={(text) => setFormData({ ...formData, unidade: text })}
                    />
                  </View>
                  <View>
                    <Text className="mb-1 text-sm font-medium text-gray-700">Turma</Text>
                    <TextInput
                      className="rounded-lg border border-gray-300 px-3 py-2"
                      value={formData.turma}
                      onChangeText={(text) => setFormData({ ...formData, turma: text })}
                    />
                  </View>
                  <View className={`flex-row ${isSmallScreen ? 'space-x-1' : 'space-x-2'}`}>
                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      className="flex-1 items-center rounded-lg bg-green-600 py-3">
                      <Text className="font-medium text-white">Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setEditMode(false)}
                      className="flex-1 items-center rounded-lg bg-gray-600 py-3">
                      <Text className="font-medium text-white">Cancelar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>

            {/* Password Change */}
            <View className="mt-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-gray-900">Alterar Senha</Text>
              <View className="space-y-3">
                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-700">Senha Atual</Text>
                  <TextInput
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    secureTextEntry
                    value={passwordData.oldPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, oldPassword: text })}
                  />
                </View>
                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-700">Nova Senha</Text>
                  <TextInput
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    secureTextEntry
                    value={passwordData.newPassword}
                    onChangeText={(text) => setPasswordData({ ...passwordData, newPassword: text })}
                  />
                </View>
                <View>
                  <Text className="mb-1 text-sm font-medium text-gray-700">
                    Confirmar Nova Senha
                  </Text>
                  <TextInput
                    className="rounded-lg border border-gray-300 px-3 py-2"
                    secureTextEntry
                    value={passwordData.confirmPassword}
                    onChangeText={(text) =>
                      setPasswordData({ ...passwordData, confirmPassword: text })
                    }
                  />
                </View>
                <TouchableOpacity
                  onPress={handleChangePassword}
                  className="mt-4 items-center rounded-lg bg-blue-600 py-3">
                  <Text className="font-medium text-white">Alterar Senha</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Two-Factor Authentication */}
            <View className="mt-6 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="shield-checkmark" size={20} color="#059669" />
                  <Text className="ml-2 text-lg font-semibold text-gray-900">
                    Autenticação de Dois Fatores
                  </Text>
                </View>
                {twoFAEnabled ? (
                  <View className="rounded-full bg-green-100 px-2 py-1">
                    <Text className="text-xs font-medium text-green-800">Ativado</Text>
                  </View>
                ) : (
                  <View className="rounded-full bg-gray-100 px-2 py-1">
                    <Text className="text-xs font-medium text-gray-800">Desativado</Text>
                  </View>
                )}
              </View>
              <Text className="mb-4 text-sm text-gray-600">
                {twoFAEnabled
                  ? 'Sua conta está protegida com autenticação de dois fatores.'
                  : 'Ative o 2FA para aumentar a segurança da sua conta.'}
              </Text>

              {/* Setup flow */}
              {!twoFAEnabled && !twoFAQr && (
                <TouchableOpacity
                  onPress={handleEnable2FA}
                  className="self-start rounded-lg bg-green-600 px-4 py-2">
                  <Text className="text-sm font-medium text-white">Ativar 2FA</Text>
                </TouchableOpacity>
              )}

              {/* Show QR and confirmation input */}
              {!twoFAEnabled && twoFAQr && (
                <View>
                  <Text className="mb-2 text-sm font-medium text-gray-700">
                    Escaneie o QR no autenticador
                  </Text>
                  <Image
                    source={{ uri: twoFAQr }}
                    style={{ width: 180, height: 180, alignSelf: 'flex-start', marginBottom: 12 }}
                  />
                  <Text className="mb-2 text-sm font-medium text-gray-700">
                    Código do autenticador
                  </Text>
                  <TextInput
                    className="w-48 rounded-lg border border-gray-300 px-3 py-2"
                    placeholder="6 dígitos"
                    value={twoFACode}
                    onChangeText={(t) => setTwoFACode(t.replace(/\D/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity
                    onPress={handleConfirmEnable2FA}
                    className="mt-3 self-start rounded-lg bg-green-600 px-4 py-2">
                    <Text className="text-sm font-medium text-white">Confirmar Ativação</Text>
                  </TouchableOpacity>
                </View>
              )}

              {twoFAEnabled && (
                <TouchableOpacity
                  onPress={handleDisable2FA}
                  className="self-start rounded-lg bg-red-600 px-4 py-2">
                  <Text className="text-sm font-medium text-white">Desativar 2FA</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="mt-8 items-center rounded-lg bg-red-600 px-6 py-3">
            <Text className="font-medium text-white">Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Container>
  );
}
