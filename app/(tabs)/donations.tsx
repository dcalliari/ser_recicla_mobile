import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Container } from '~/components/Container';
import { DonationCard } from '~/components/donations/DonationCard';
import { DonationModal } from '~/components/donations/DonationModal';
import { usePermissions } from '~/lib/hooks/usePermissions';
import { donationsService } from '~/lib/services/donationsService';
import type {
  PedidoDoacao,
  PedidoDoacaoCreateData,
  PedidoDoacaoUpdateData,
} from '~/lib/types/donations';
import type { Usuario } from '~/lib/types/user';
import type { Turma } from '~/lib/types/institutional';

export default function Donations() {
  const {
    isStudent,
    canAccessDonations,
    isAdmin,
    isCoordinator,
    isClassLeader,
    isCollectionPoint,
  } = usePermissions();

  // States
  const [donations, setDonations] = useState<PedidoDoacao[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<PedidoDoacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter states
  const [filterTab, setFilterTab] = useState<
    'todos' | 'pendente' | 'aprovado' | 'rejeitado' | 'coletado'
  >('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDonation, setEditingDonation] = useState<PedidoDoacao | undefined>();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Redirect students
  useEffect(() => {
    if (isStudent()) {
      router.replace('/(tabs)');
      return;
    }
  }, [isStudent]);

  // Load data
  const loadDonations = async () => {
    try {
      const data = await donationsService.getAll();
      setDonations(data);
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      Alert.alert('Erro', 'Não foi possível carregar os pedidos de doação');
    }
  };

  const loadSupportData = async () => {
    try {
      // In a real app, you'd load turmas and usuarios from their respective services
      // For now, we'll use empty arrays
      setTurmas([]);
      setUsuarios([]);
    } catch (error) {
      console.error('Erro ao carregar dados auxiliares:', error);
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadDonations(), loadSupportData()]);
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadDonations();
    } finally {
      setRefreshing(false);
    }
  };

  // Filter donations
  useEffect(() => {
    let filtered = donations;

    // Filter by status
    if (filterTab !== 'todos') {
      filtered = filtered.filter((d) => (d.status || 'pendente') === filterTab);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.codigo.toLowerCase().includes(query) ||
          d.turma?.nome?.toLowerCase().includes(query) ||
          `${d.chefe_responsavel?.first_name} ${d.chefe_responsavel?.last_name}`
            .toLowerCase()
            .includes(query)
      );
    }

    setFilteredDonations(filtered);
  }, [donations, filterTab, searchQuery]);

  // Permission checks
  if (!canAccessDonations()) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <Ionicons name="lock-closed-outline" size={64} color="#6b7280" />
          <Text className="mt-4 text-lg font-medium text-gray-600">Acesso Restrito</Text>
          <Text className="mt-2 text-center text-gray-500">
            Você não tem permissão para acessar esta seção
          </Text>
        </View>
      </Container>
    );
  }

  // Determine user capabilities
  const canCreateEdit = isAdmin() || isClassLeader();
  const canApprove = isAdmin() || isCoordinator();
  const canMarkCollected = isCollectionPoint();

  // Handlers
  const handleCreateDonation = () => {
    setEditingDonation(undefined);
    setModalVisible(true);
  };

  const handleEditDonation = (donation: PedidoDoacao) => {
    setEditingDonation(donation);
    setModalVisible(true);
  };

  const handleDeleteDonation = (donation: PedidoDoacao) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Deseja realmente excluir o pedido de doação "${donation.codigo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => confirmDelete(donation.id),
        },
      ]
    );
  };

  const confirmDelete = async (id: number) => {
    try {
      await donationsService.delete(id);
      setDonations((prev) => prev.filter((d) => d.id !== id));
      Alert.alert('Sucesso', 'Pedido de doação excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir doação:', error);
      Alert.alert('Erro', 'Não foi possível excluir o pedido de doação');
    }
  };

  const handleApproveDonation = async (donation: PedidoDoacao) => {
    try {
      const updated = await donationsService.approve(donation.id);
      setDonations((prev) => prev.map((d) => (d.id === donation.id ? updated : d)));
      Alert.alert('Sucesso', 'Pedido de doação aprovado com sucesso');
    } catch (error) {
      console.error('Erro ao aprovar doação:', error);
      Alert.alert('Erro', 'Não foi possível aprovar o pedido de doação');
    }
  };

  const handleRejectDonation = (donation: PedidoDoacao) => {
    Alert.prompt('Rejeitar Doação', 'Digite o motivo da rejeição (opcional):', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rejeitar',
        onPress: (reason?: string) => confirmReject(donation.id, reason),
      },
    ]);
  };

  const confirmReject = async (id: number, reason?: string) => {
    try {
      const updated = await donationsService.reject(id, reason);
      setDonations((prev) => prev.map((d) => (d.id === id ? updated : d)));
      Alert.alert('Sucesso', 'Pedido de doação rejeitado');
    } catch (error) {
      console.error('Erro ao rejeitar doação:', error);
      Alert.alert('Erro', 'Não foi possível rejeitar o pedido de doação');
    }
  };

  const handleMarkCollected = async (donation: PedidoDoacao) => {
    try {
      const updated = await donationsService.markAsCollected(donation.id);
      setDonations((prev) => prev.map((d) => (d.id === donation.id ? updated : d)));
      Alert.alert('Sucesso', 'Pedido marcado como coletado');
    } catch (error) {
      console.error('Erro ao marcar como coletado:', error);
      Alert.alert('Erro', 'Não foi possível marcar como coletado');
    }
  };

  const handleSaveDonation = async (data: PedidoDoacaoCreateData | PedidoDoacaoUpdateData) => {
    try {
      if (editingDonation) {
        // Update
        const updated = await donationsService.update(
          editingDonation.id,
          data as PedidoDoacaoUpdateData
        );
        setDonations((prev) => prev.map((d) => (d.id === editingDonation.id ? updated : d)));
        Alert.alert('Sucesso', 'Pedido de doação atualizado com sucesso');
      } else {
        // Create
        const created = await donationsService.create(data as PedidoDoacaoCreateData);
        setDonations((prev) => [...prev, created]);
        Alert.alert('Sucesso', 'Pedido de doação criado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao salvar doação:', error);
      throw error; // Let the modal handle the error
    }
  };

  if (loading) {
    return (
      <Container>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="mt-4 text-gray-600">Carregando doações...</Text>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View className="flex-1 p-4">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-sm text-gray-600">
              {filteredDonations.length} {filteredDonations.length === 1 ? 'pedido' : 'pedidos'}
            </Text>
          </View>

          {canCreateEdit && (
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-green-600 px-4 py-2"
              onPress={handleCreateDonation}
              activeOpacity={0.7}>
              <Ionicons name="add" size={20} color="white" />
              <Text className="ml-1 font-medium text-white">Nova Doação</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Search Input */}
        <View className="mb-4">
          <View className="relative">
            <TextInput
              className="h-12 rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-gray-900"
              placeholder="Buscar por código, turma ou responsável..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View className="absolute left-3 top-3">
              <Ionicons name="search" size={18} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View className="mx-0 mb-4 flex-row rounded-lg border border-gray-200 bg-gray-50">
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
            style={filterTab === 'pendente' ? { backgroundColor: 'white' } : {}}
            onPress={() => setFilterTab('pendente')}>
            <Text
              className={`text-center text-sm font-medium ${
                filterTab === 'pendente' ? 'text-blue-600' : 'text-gray-600'
              }`}>
              Pendentes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-md px-3 py-2"
            style={filterTab === 'aprovado' ? { backgroundColor: 'white' } : {}}
            onPress={() => setFilterTab('aprovado')}>
            <Text
              className={`text-center text-sm font-medium ${
                filterTab === 'aprovado' ? 'text-blue-600' : 'text-gray-600'
              }`}>
              Aprovados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 rounded-md px-3 py-2"
            style={filterTab === 'coletado' ? { backgroundColor: 'white' } : {}}
            onPress={() => setFilterTab('coletado')}>
            <Text
              className={`text-center text-sm font-medium ${
                filterTab === 'coletado' ? 'text-blue-600' : 'text-gray-600'
              }`}>
              Coletados
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <FlatList
          data={filteredDonations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <DonationCard
              donation={item}
              onEdit={canCreateEdit ? handleEditDonation : undefined}
              onDelete={canCreateEdit ? handleDeleteDonation : undefined}
              onApprove={canApprove ? handleApproveDonation : undefined}
              onReject={canApprove ? handleRejectDonation : undefined}
              onMarkCollected={canMarkCollected ? handleMarkCollected : undefined}
              canEdit={canCreateEdit}
              canApprove={canApprove}
              canMarkCollected={canMarkCollected}
            />
          )}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Ionicons name="gift-outline" size={64} color="#d1d5db" />
              <Text className="mt-4 text-lg font-medium text-gray-500">
                {filterTab === 'todos'
                  ? 'Nenhum pedido de doação encontrado'
                  : `Nenhum pedido ${filterTab} encontrado`}
              </Text>
              <Text className="mt-2 text-center text-gray-400">
                {canCreateEdit
                  ? 'Toque no botão "Nova Doação" para começar'
                  : 'Aguarde novos pedidos serem criados'}
              </Text>
            </View>
          }
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: 20,
          }}
        />
      </View>

      {/* Modal */}
      <DonationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveDonation}
        donation={editingDonation}
        turmas={turmas}
        usuarios={usuarios}
      />
    </Container>
  );
}
