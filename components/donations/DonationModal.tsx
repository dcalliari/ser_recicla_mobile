import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  PedidoDoacao,
  PedidoDoacaoCreateData,
  PedidoDoacaoUpdateData,
} from '~/lib/types/donations';
import type { Usuario } from '~/lib/types/user';
import type { Turma } from '~/lib/types/institutional';

interface DonationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: PedidoDoacaoCreateData | PedidoDoacaoUpdateData) => Promise<void>;
  donation?: PedidoDoacao;
  turmas?: Turma[];
  usuarios?: Usuario[];
  isLoading?: boolean;
}

export const DonationModal: React.FC<DonationModalProps> = ({
  visible,
  onClose,
  onSave,
  donation,
  turmas = [],
  usuarios = [],
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    turma_id: 0,
    chefe_responsavel_id: 0,
    alunos_ids: [] as number[],
    observacoes: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (donation) {
      // Editing mode
      setFormData({
        codigo: donation.codigo,
        turma_id: donation.turma?.id || 0,
        chefe_responsavel_id: donation.chefe_responsavel?.id || 0,
        alunos_ids: donation.alunos?.map((aluno) => aluno.id) || [],
        observacoes: donation.observacoes || '',
      });
    } else {
      // Creating mode
      setFormData({
        codigo: '',
        turma_id: 0,
        chefe_responsavel_id: 0,
        alunos_ids: [],
        observacoes: '',
      });
    }
    setErrors({});
  }, [donation, visible]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (formData.turma_id === 0) {
      newErrors.turma_id = 'Turma é obrigatória';
    }

    if (formData.chefe_responsavel_id === 0) {
      newErrors.chefe_responsavel_id = 'Responsável é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      if (donation) {
        // Update mode
        await onSave({
          id: donation.id,
          ...formData,
        } as PedidoDoacaoUpdateData);
      } else {
        // Create mode
        await onSave(formData as PedidoDoacaoCreateData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar doação:', error);
      Alert.alert('Erro', 'Não foi possível salvar o pedido de doação');
    } finally {
      setSaving(false);
    }
  };

  const selectedTurma = turmas.find((t) => t.id === formData.turma_id);
  const selectedResponsavel = usuarios.find((u) => u.id === formData.chefe_responsavel_id);
  const selectedAlunos = usuarios.filter((u) => formData.alunos_ids.includes(u.id));

  // Filter chefes de turma for responsavel field
  const chefes = usuarios.filter((u) => u.perfil === 'CHEFE');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-900">
            {donation ? 'Editar Doação' : 'Nova Doação'}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            className="flex-row items-center rounded-md bg-green-600 px-3 py-2"
            activeOpacity={0.7}>
            {saving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="checkmark" size={16} color="white" />
                <Text className="ml-1 text-sm font-medium text-white">Salvar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          {/* Código */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Código *</Text>
            <TextInput
              className="rounded-md border border-gray-300 p-3 text-base"
              value={formData.codigo}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, codigo: text }))}
              placeholder="Ex: DOA-001"
              placeholderTextColor="#9ca3af"
            />
            {errors.codigo && <Text className="mt-1 text-sm text-red-600">{errors.codigo}</Text>}
          </View>

          {/* Turma */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Turma *</Text>
            <TouchableOpacity
              className="rounded-md border border-gray-300 p-3"
              onPress={() => {
                Alert.alert(
                  'Selecionar Turma',
                  'Escolha uma turma:',
                  turmas
                    .map((turma) => ({
                      text: turma.nome,
                      onPress: () => setFormData((prev) => ({ ...prev, turma_id: turma.id })),
                    }))
                    .concat([{ text: 'Cancelar', onPress: () => {} }])
                );
              }}
              activeOpacity={0.7}>
              <Text className={`text-base ${selectedTurma ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedTurma ? selectedTurma.nome : 'Selecione uma turma'}
              </Text>
            </TouchableOpacity>
            {errors.turma_id && (
              <Text className="mt-1 text-sm text-red-600">{errors.turma_id}</Text>
            )}
          </View>

          {/* Responsável */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Responsável *</Text>
            <TouchableOpacity
              className="rounded-md border border-gray-300 p-3"
              onPress={() => {
                Alert.alert(
                  'Selecionar Responsável',
                  'Escolha o responsável:',
                  chefes
                    .map((chefe) => ({
                      text: `${chefe.first_name} ${chefe.last_name}`,
                      onPress: () =>
                        setFormData((prev) => ({ ...prev, chefe_responsavel_id: chefe.id })),
                    }))
                    .concat([{ text: 'Cancelar', onPress: () => {} }])
                );
              }}
              activeOpacity={0.7}>
              <Text
                className={`text-base ${selectedResponsavel ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedResponsavel
                  ? `${selectedResponsavel.first_name} ${selectedResponsavel.last_name}`
                  : 'Selecione um responsável'}
              </Text>
            </TouchableOpacity>
            {errors.chefe_responsavel_id && (
              <Text className="mt-1 text-sm text-red-600">{errors.chefe_responsavel_id}</Text>
            )}
          </View>

          {/* Participantes */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Participantes (Opcional)</Text>
            <TouchableOpacity
              className="rounded-md border border-gray-300 p-3"
              onPress={() => {
                // Simple multi-select implementation
                Alert.alert(
                  'Participantes Selecionados',
                  selectedAlunos.length > 0
                    ? selectedAlunos.map((a) => `${a.first_name} ${a.last_name}`).join(', ')
                    : 'Nenhum participante selecionado',
                  [
                    {
                      text: 'Limpar',
                      onPress: () => setFormData((prev) => ({ ...prev, alunos_ids: [] })),
                    },
                    { text: 'OK' },
                  ]
                );
              }}
              activeOpacity={0.7}>
              <Text
                className={`text-base ${selectedAlunos.length > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                {selectedAlunos.length > 0
                  ? `${selectedAlunos.length} participante(s) selecionado(s)`
                  : 'Selecione os participantes'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Observações */}
          <View className="mb-4">
            <Text className="mb-2 text-sm font-medium text-gray-700">Observações</Text>
            <TextInput
              className="rounded-md border border-gray-300 p-3 text-base"
              value={formData.observacoes}
              onChangeText={(text) => setFormData((prev) => ({ ...prev, observacoes: text }))}
              placeholder="Observações sobre o pedido de doação..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};
