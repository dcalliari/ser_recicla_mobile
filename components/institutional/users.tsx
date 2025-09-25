import { Feather } from '@expo/vector-icons';
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
  ScrollView,
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

  // Estados para cadastro de usuário único
  const [newUserModalVisible, setNewUserModalVisible] = useState(false);
  const [newUserData, setNewUserData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    matricula: '',
  });
  const [creatingUser, setCreatingUser] = useState(false);

  // Estados para filtros
  const [filterTab, setFilterTab] = useState<'todos' | 'cadastrados' | 'pre-cadastrados'>(
    'cadastrados'
  );

  // Estados para edição
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);

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

  // Função para edição de usuário
  const handleEditUser = (user: Usuario) => {
    setEditingUser(user);
    const isPreCadastrado = !(user.first_name && user.last_name && user.email);

    if (isPreCadastrado) {
      // Para pré-cadastrados, apenas completar o cadastro
      setNewUserData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        matricula: user.matricula,
      });
    } else {
      // Para usuários completos, carregar dados existentes
      setNewUserData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.email, // Assume que username é baseado no email
        password: '', // Senha não é carregada por segurança
        password_confirm: '',
        matricula: user.matricula,
      });
    }

    setNewUserModalVisible(true);
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
    // Primeiro aplica o filtro de busca
    let matchesSearch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      matchesSearch =
        usuario.first_name.toLowerCase().includes(query) ||
        usuario.last_name.toLowerCase().includes(query) ||
        usuario.email.toLowerCase().includes(query) ||
        usuario.matricula.toLowerCase().includes(query) ||
        UsuarioPerfil[usuario.perfil as keyof typeof UsuarioPerfil]?.toLowerCase().includes(query);
    }

    // Depois aplica o filtro por aba
    let matchesTab = true;
    if (filterTab === 'cadastrados') {
      // Usuários cadastrados são aqueles que têm first_name e last_name preenchidos
      matchesTab = !!(usuario.first_name && usuario.last_name && usuario.email);
    } else if (filterTab === 'pre-cadastrados') {
      // Usuários pré-cadastrados são aqueles que só têm matrícula
      matchesTab = !(usuario.first_name && usuario.last_name && usuario.email);
    }

    return matchesSearch && matchesTab;
  });

  const handleRemoveMatricula = (index: number) => {
    setMatriculas((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePreCadastro = async () => {
    // Include any matricula currently in the input
    const finalMatriculas = [...matriculas];
    if (matriculaInput.trim()) {
      finalMatriculas.push(matriculaInput.trim());
    }

    if (finalMatriculas.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma matrícula');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/v1/auth/pre-cadastro-alunos/', { matriculas: finalMatriculas });
      Alert.alert('Sucesso', 'Pré-cadastro realizado com sucesso');
      setModalVisible(false);
      setMatriculas([]);
      setMatriculaInput('');
      fetchUsuarios(); // Refresh the list
    } catch {
      Alert.alert('Erro', 'Falha no pré-cadastro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateUser = async () => {
    if (
      !newUserData.first_name.trim() ||
      !newUserData.last_name.trim() ||
      !newUserData.email.trim() ||
      !newUserData.username.trim() ||
      !newUserData.matricula.trim()
    ) {
      Alert.alert('Erro', 'Todos os campos são obrigatórios');
      return;
    }

    // Para novos usuários ou edição com senha
    if (!editingUser || newUserData.password.trim()) {
      if (!newUserData.password.trim() || !newUserData.password_confirm.trim()) {
        Alert.alert('Erro', 'Senha é obrigatória');
        return;
      }

      if (newUserData.password !== newUserData.password_confirm) {
        Alert.alert('Erro', 'As senhas não coincidem');
        return;
      }
    }

    setCreatingUser(true);
    try {
      if (editingUser) {
        // Editar usuário existente
        const updateData: any = {
          matricula: newUserData.matricula,
          first_name: newUserData.first_name,
          last_name: newUserData.last_name,
          email: newUserData.email,
          username: newUserData.username,
        };

        // Só inclui senha se foi preenchida
        if (newUserData.password.trim()) {
          updateData.password = newUserData.password;
          updateData.password_confirm = newUserData.password_confirm;
        }

        await api.put(`/v1/auth/detail/usuarios/${editingUser.id}/`, updateData);
        Alert.alert('Sucesso', 'Usuário atualizado com sucesso');
      } else {
        // Criar novo usuário
        await api.post('/v1/auth/detail/usuarios/', {
          matricula: newUserData.matricula,
          first_name: newUserData.first_name,
          last_name: newUserData.last_name,
          email: newUserData.email,
          username: newUserData.username,
          password: newUserData.password,
          password_confirm: newUserData.password_confirm,
        });
        Alert.alert('Sucesso', 'Usuário criado com sucesso');
      }

      setNewUserModalVisible(false);
      setEditingUser(null);
      setNewUserData({
        first_name: '',
        last_name: '',
        email: '',
        username: '',
        password: '',
        password_confirm: '',
        matricula: '',
      });
      fetchUsuarios(); // Refresh the list
    } catch (error: any) {
      console.error('Erro ao criar/editar usuário:', error);
      let errorMessage = editingUser ? 'Falha ao atualizar usuário' : 'Falha ao criar usuário';

      if (error?.errors) {
        // Handle validation errors
        const errorFields = Object.keys(error.errors);
        if (errorFields.length > 0) {
          const firstField = errorFields[0];
          const firstError = error.errors[firstField][0];
          errorMessage = `${firstField}: ${firstError}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Erro', errorMessage);
    } finally {
      setCreatingUser(false);
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

  const renderUsuario = ({ item }: { item: Usuario }) => {
    const isPreCadastrado = !(item.first_name && item.last_name && item.email);

    if (isPreCadastrado) {
      // Layout simplificado para pré-cadastrados
      return (
        <View className="mx-4 mb-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">
                Matrícula: {item.matricula}
              </Text>
              <View className="mt-2">
                <View className="self-start rounded-full bg-orange-100 px-2 py-1">
                  <Text className="text-xs font-medium text-orange-800">Pré-cadastrado</Text>
                </View>
              </View>
            </View>

            <View className="flex-row space-x-2">
              <TouchableOpacity
                className="mr-1 rounded-md bg-blue-500 p-2"
                onPress={() => handleEditUser(item)}>
                <Feather name="edit-2" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-md bg-red-500 p-2"
                onPress={() => handleDeleteUser(item)}>
                <Feather name="trash-2" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    // Layout completo para usuários cadastrados
    return (
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
                  {UsuarioPerfil[item.perfil as keyof typeof UsuarioPerfil] || item.perfil}
                </Text>
              </View>
            </View>

            {item.turma && (
              <Text className="mt-1 text-xs text-gray-500">Turma: {item.turma.nome}</Text>
            )}
          </View>

          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="mr-1 rounded-md bg-blue-500 p-2"
              onPress={() => handleEditUser(item)}>
              <Feather name="edit-2" size={16} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-md bg-red-500 p-2"
              onPress={() => handleDeleteUser(item)}>
              <Feather name="trash-2" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

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
      {/* Actions Section */}
      <View className="mt-3 px-4 py-2">
        {/* Buttons */}
        <View className="mb-2 flex-row">
          <TouchableOpacity
            className="mr-2 flex-1 items-center justify-center rounded-lg bg-blue-600 px-4 py-3 shadow-sm"
            onPress={() => setNewUserModalVisible(true)}>
            <Text className="text-center font-semibold text-white">Novo Usuário</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 items-center justify-center rounded-lg bg-green-600 px-4 py-3 shadow-sm"
            onPress={() => setModalVisible(true)}>
            <Text className="text-center font-semibold text-white">Pré-cadastrar Lote</Text>
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

      {/* Filter Tabs */}
      <View className="mx-4 mb-1 flex-row rounded-lg border border-gray-200 bg-gray-50">
        <TouchableOpacity
          className="flex-1 rounded-md px-3 py-2"
          style={filterTab === 'todos' ? { backgroundColor: 'white' } : {}}
          onPress={() => setFilterTab('todos')}>
          <Text
            className={`text-center text-sm font-medium ${
              filterTab === 'todos' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-md px-3 py-2"
          style={filterTab === 'cadastrados' ? { backgroundColor: 'white' } : {}}
          onPress={() => setFilterTab('cadastrados')}>
          <Text
            className={`text-center text-sm font-medium ${
              filterTab === 'cadastrados' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            Cadastrados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-md px-3 py-2"
          style={filterTab === 'pre-cadastrados' ? { backgroundColor: 'white' } : {}}
          onPress={() => setFilterTab('pre-cadastrados')}>
          <Text
            className={`text-center text-sm font-medium ${
              filterTab === 'pre-cadastrados' ? 'text-blue-600' : 'text-gray-600'
            }`}>
            Pré-cadastrados
          </Text>
        </TouchableOpacity>
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
          <View className="max-h-[80vh] rounded-lg bg-white p-6 shadow-xl">
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

            <ScrollView showsVerticalScrollIndicator={false} className="mb-4 max-h-[200px]">
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
            </ScrollView>

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

      {/* Modal para cadastro/edição de usuário */}
      <Modal
        transparent={true}
        visible={newUserModalVisible}
        animationType="fade"
        onRequestClose={() => setNewUserModalVisible(false)}>
        <View className="flex-1 justify-center bg-black/20 p-4">
          <View className="rounded-lg bg-white p-6 shadow-xl">
            <Text className="mb-4 text-xl font-semibold text-gray-900">
              {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
            </Text>
            <Text className="mb-4 text-gray-600">
              {editingUser
                ? 'Atualize os dados do usuário'
                : 'Preencha os dados para criar um novo usuário'}
            </Text>

            <View className="space-y-4">
              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Nome</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Digite o primeiro nome"
                  value={newUserData.first_name}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, first_name: text }))}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Sobrenome</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Digite o sobrenome"
                  value={newUserData.last_name}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, last_name: text }))}
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Email</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Digite o email"
                  value={newUserData.email}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Nome de Usuário</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Digite o nome de usuário"
                  value={newUserData.username}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, username: text }))}
                  autoCapitalize="none"
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  Senha {editingUser ? '(deixe em branco para manter a atual)' : ''}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder={editingUser ? 'Nova senha (opcional)' : 'Digite a senha'}
                  value={newUserData.password}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, password: text }))}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  Confirmar Senha {editingUser ? '(se informada acima)' : ''}
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder={editingUser ? 'Confirme a nova senha' : 'Confirme a senha'}
                  value={newUserData.password_confirm}
                  onChangeText={(text) =>
                    setNewUserData((prev) => ({ ...prev, password_confirm: text }))
                  }
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="mb-2 text-sm font-medium text-gray-700">Matrícula</Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Digite a matrícula"
                  value={newUserData.matricula}
                  onChangeText={(text) => setNewUserData((prev) => ({ ...prev, matricula: text }))}
                />
              </View>
            </View>

            <View className="mt-6 flex-row justify-end space-x-3">
              <TouchableOpacity
                className="rounded-lg border border-gray-300 bg-white px-4 py-2"
                onPress={() => {
                  setNewUserModalVisible(false);
                  setEditingUser(null);
                  setNewUserData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    username: '',
                    password: '',
                    password_confirm: '',
                    matricula: '',
                  });
                }}>
                <Text className="text-gray-700">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-blue-600 px-4 py-2 shadow-sm"
                onPress={handleCreateUser}
                disabled={creatingUser}>
                {creatingUser ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white">{editingUser ? 'Atualizar' : 'Criar Usuário'}</Text>
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
