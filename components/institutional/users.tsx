import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { api } from '~/lib/api';
import type { Usuario } from '~/lib/types/user';
import { UsuarioPerfil } from '~/lib/types/user';

export default function Users() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [matriculaInput, setMatriculaInput] = useState('');
  const [matriculas, setMatriculas] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Estados para exclusão
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [userToDelete, setUserToDelete] = useState<Usuario | null>(null);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const data = await api.get<Usuario[]>('/v1/auth/detail/usuarios/');
      setUsuarios(data);
    } catch {
      Alert.alert('Erro', 'Falha ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  // Funções para exclusão
  const handleDeleteUser = (user: Usuario) => {
    setUserToDelete(user);
    setDeleteModalVisible(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await api.delete(`/v1/auth/detail/usuarios/${userToDelete.id}/`);
      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id));
      Alert.alert('Sucesso', 'Usuário excluído com sucesso');
    } catch {
      Alert.alert('Erro', 'Falha ao excluir usuário');
    } finally {
      setDeleteModalVisible(false);
      setUserToDelete(null);
    }
  };

  const filteredUsuarios = usuarios.filter((usuario) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      usuario.first_name.toLowerCase().includes(query) ||
      usuario.last_name.toLowerCase().includes(query) ||
      usuario.email.toLowerCase().includes(query) ||
      usuario.matricula.toLowerCase().includes(query) ||
      UsuarioPerfil[usuario.perfil as keyof typeof UsuarioPerfil].toLowerCase().includes(query)
    );
  });

  const handleRemoveMatricula = (index: number) => {
    setMatriculas((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreCadastro = async () => {
    if (matriculas.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma matrícula');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/v1/auth/pre-cadastro-alunos/', { matriculas });
      Alert.alert('Sucesso', 'Pré-cadastro realizado com sucesso');
      setModalVisible(false);
      setMatriculas([]);
      fetchUsuarios(); // Refresh the list
    } catch {
      Alert.alert('Erro', 'Falha no pré-cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  const getPerfilBadgeColor = (perfil: string) => {
    switch (perfil) {
      case 'ALUNO':
        return 'bg-blue-100 text-blue-800';
      case 'CHEFE':
        return 'bg-green-100 text-green-800';
      case 'COORD':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN_UNI':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderUsuario = ({ item }: { item: Usuario }) => (
    <View className="mx-4 mb-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">
            {item.first_name} {item.last_name}
          </Text>
          <Text className="text-sm text-gray-600">{item.email}</Text>
          <Text className="text-sm text-gray-500">{item.matricula}</Text>

          <View className="mt-2 flex-row items-center">
            <View className={`rounded-full px-2 py-1 ${getPerfilBadgeColor(item.perfil)}`}>
              <Text className="text-xs font-medium">
                {UsuarioPerfil[item.perfil as keyof typeof UsuarioPerfil]}
              </Text>
            </View>
          </View>

          {item.turma && (
            <Text className="mt-1 text-xs text-gray-500">Turma: {item.turma.nome}</Text>
          )}
        </View>

        <View className="flex-row">
          <TouchableOpacity
            className="rounded-md bg-red-500 px-3 py-2"
            onPress={() => handleDeleteUser(item)}>
            <Text className="text-sm text-white">Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center ">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-2 text-gray-600">Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 ">
      {/* Header */}
      <View className="items-center justify-center border-b border-b-gray-200 px-6 py-4">
        <Text className="text-gray-600">Gerencie os usuários do sistema institucional</Text>
      </View>

      {/* Actions Section */}
      <View className="p-4">
        {/* Button */}
        <View className="mb-4">
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-lg bg-green-600 px-4 py-3 shadow-sm"
            onPress={() => setModalVisible(true)}>
            <Text className="text-center font-semibold text-white">
              Pré-cadastrar Usuários em Lote
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="relative">
          <TextInput
            className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
            placeholder="Buscar usuários por nome, email ou matrícula..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <View className="absolute left-3 top-3">
            <Text className="text-gray-400"></Text>
          </View>
        </View>
      </View>

      {/* Users List */}
      <FlatList
        data={filteredUsuarios}
        renderItem={renderUsuario}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-lg text-gray-500">
              {searchQuery.trim()
                ? 'Nenhum usuário encontrado para esta busca'
                : 'Nenhum usuário encontrado'}
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              {searchQuery.trim()
                ? 'Tente uma busca diferente'
                : 'Comece adicionando usuários ao sistema'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Modal para pré-cadastro */}
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <View className="flex-1 justify-center bg-black/20 p-4">
          <View className="rounded-lg bg-white p-6 shadow-xl">
            {/* Botão Limpar no canto superior direito */}
            <View className="absolute right-4 top-4 z-10">
              <TouchableOpacity
                className="rounded-full bg-gray-100 p-2"
                onPress={() => {
                  setMatriculas([]);
                  setMatriculaInput('');
                }}>
                <Text className="text-xs text-gray-600">Limpar 🗑️</Text>
              </TouchableOpacity>
            </View>

            <Text className="mb-4 text-xl font-semibold text-gray-900">
              Pré-cadastro de Usuários
            </Text>
            <Text className="mb-4 text-gray-600">
              Adicione múltiplas matrículas para pré-cadastro em lote
            </Text>

            <View className="mb-4">
              <View className="min-h-[50px] flex-row flex-wrap items-center rounded-lg border border-gray-300 bg-gray-50 p-3">
                {matriculas.map((matricula, index) => (
                  <View
                    key={index}
                    className="mb-1 mr-2 flex-row items-center rounded-full bg-blue-100 px-3 py-1 shadow-sm">
                    <Text className="mr-2 text-sm font-medium text-blue-800">{matricula}</Text>
                    <TouchableOpacity
                      className="h-4 items-center justify-center rounded-full"
                      onPress={() => handleRemoveMatricula(index)}
                      activeOpacity={0.7}>
                      <Text className="text-xs font-bold text-red-500">×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
                <TextInput
                  className="min-w-[120px] flex-1 text-base text-gray-900"
                  placeholder={
                    matriculas.length === 0 ? 'Digite as matrículas (use espaço ou Enter)' : ''
                  }
                  value={matriculaInput}
                  onChangeText={(text) => {
                    // Detecta se um espaço foi adicionado ao final
                    if (
                      text.endsWith(' ') &&
                      matriculaInput.trim() &&
                      !matriculaInput.endsWith(' ')
                    ) {
                      // Espaço foi pressionado e há texto - transforma em chip
                      const newMatricula = matriculaInput.trim();
                      if (newMatricula) {
                        setMatriculas((prev) => [...prev, newMatricula]);
                        setMatriculaInput('');
                      }
                      return;
                    }

                    // Remove espaços do início e múltiplos espaços consecutivos
                    const cleanText = text.replace(/\s+/g, ' ').trimStart();

                    // Se há múltiplas palavras separadas por espaço
                    if (cleanText.includes(' ')) {
                      const parts = cleanText.split(' ').filter((part) => part.length > 0);
                      if (parts.length > 1) {
                        // Adiciona todas as partes exceto a última como matrículas
                        const matriculasToAdd = parts.slice(0, -1);
                        setMatriculas((prev) => [...prev, ...matriculasToAdd]);
                        // Mantém apenas a última parte no input
                        setMatriculaInput(parts[parts.length - 1]);
                      } else {
                        setMatriculaInput(cleanText);
                      }
                    } else {
                      // Texto normal sem espaços
                      setMatriculaInput(cleanText);
                    }
                  }}
                  onKeyPress={(e) => {
                    // Detecta backspace quando o campo está vazio
                    if (
                      e.nativeEvent.key === 'Backspace' &&
                      !matriculaInput &&
                      matriculas.length > 0
                    ) {
                      // Remove o último chip
                      setMatriculas((prev) => prev.slice(0, -1));
                    }
                  }}
                  onSubmitEditing={() => {
                    if (matriculaInput.trim()) {
                      setMatriculas([...matriculas, matriculaInput.trim()]);
                      setMatriculaInput('');
                    }
                  }}
                  multiline={false}
                  keyboardType="default"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                className="rounded-lg border border-gray-300 bg-white px-4 py-2"
                onPress={() => {
                  setModalVisible(false);
                  setMatriculas([]);
                  setMatriculaInput('');
                }}>
                <Text className="text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-green-600 px-4 py-2 shadow-sm"
                onPress={handlePreCadastro}
                disabled={submitting}>
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white">Pré-cadastrar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/20 p-4">
          <View className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <Text className="mb-2 text-lg font-semibold text-gray-900">Confirmar Exclusão</Text>
            <Text className="mb-4 text-gray-600">
              Você realmente deseja excluir o usuário &quot;{userToDelete?.first_name}{' '}
              {userToDelete?.last_name}&quot;? Esta ação não pode ser desfeita.
            </Text>

            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity
                className="rounded-lg border border-gray-300 bg-white px-4 py-2"
                onPress={() => setDeleteModalVisible(false)}>
                <Text className="text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-red-600 px-4 py-2 shadow-sm"
                onPress={confirmDeleteUser}>
                <Text className="text-white">Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
