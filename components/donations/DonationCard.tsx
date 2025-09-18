import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PedidoDoacao, DonationStatus } from '~/lib/types/donations';
import { DonationStatusLabels, DonationStatusColors } from '~/lib/types/donations';

interface DonationCardProps {
  donation: PedidoDoacao;
  onEdit?: (donation: PedidoDoacao) => void;
  onDelete?: (donation: PedidoDoacao) => void;
  onApprove?: (donation: PedidoDoacao) => void;
  onReject?: (donation: PedidoDoacao) => void;
  onMarkCollected?: (donation: PedidoDoacao) => void;
  canEdit?: boolean;
  canApprove?: boolean;
  canMarkCollected?: boolean;
}

export const DonationCard: React.FC<DonationCardProps> = ({
  donation,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onMarkCollected,
  canEdit = false,
  canApprove = false,
  canMarkCollected = false,
}) => {
  const status = (donation.status || 'pendente') as DonationStatus;
  const statusColor = DonationStatusColors[status];
  const statusLabel = DonationStatusLabels[status];

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  const getStatusIcon = (status: DonationStatus) => {
    switch (status) {
      case 'pendente':
        return 'time-outline';
      case 'aprovado':
        return 'checkmark-circle-outline';
      case 'rejeitado':
        return 'close-circle-outline';
      case 'coletado':
        return 'cube-outline';
      default:
        return 'help-circle-outline';
    }
  };

  return (
    <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-900">{donation.codigo}</Text>
          <Text className="text-sm text-gray-600">
            {donation.turma?.nome || 'Turma não informada'}
          </Text>
        </View>
        <View
          className="flex-row items-center rounded-full px-3 py-1"
          style={{ backgroundColor: statusColor + '20' }}>
          <Ionicons name={getStatusIcon(status)} size={16} color={statusColor} />
          <Text className="ml-1 text-xs font-medium" style={{ color: statusColor }}>
            {statusLabel}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="mb-3 space-y-2">
        <View className="flex-row items-center">
          <Ionicons name="person-outline" size={16} color="#6b7280" />
          <Text className="ml-2 text-sm text-gray-600">
            Responsável: {donation.chefe_responsavel?.first_name}{' '}
            {donation.chefe_responsavel?.last_name}
          </Text>
        </View>

        {donation.alunos && donation.alunos.length > 0 && (
          <View className="flex-row items-start">
            <Ionicons name="people-outline" size={16} color="#6b7280" />
            <Text className="ml-2 flex-1 text-sm text-gray-600">
              Participantes ({donation.alunos.length}):{' '}
              {donation.alunos.map((aluno) => `${aluno.first_name} ${aluno.last_name}`).join(', ')}
            </Text>
          </View>
        )}

        {donation.data_criacao && (
          <View className="flex-row items-center">
            <Ionicons name="calendar-outline" size={16} color="#6b7280" />
            <Text className="ml-2 text-sm text-gray-600">
              Criado em: {formatDate(donation.data_criacao)}
            </Text>
          </View>
        )}

        {donation.observacoes && (
          <View className="flex-row items-start">
            <Ionicons name="document-text-outline" size={16} color="#6b7280" />
            <Text className="ml-2 flex-1 text-sm text-gray-600">
              Observações: {donation.observacoes}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      {(canEdit || canApprove || canMarkCollected) && (
        <View className="border-t border-gray-100 pt-3">
          <View className="flex-row flex-wrap gap-2">
            {canEdit && (
              <>
                <TouchableOpacity
                  className="flex-row items-center rounded-md bg-blue-50 px-3 py-2"
                  onPress={() => onEdit?.(donation)}
                  activeOpacity={0.7}>
                  <Ionicons name="pencil-outline" size={16} color="#3b82f6" />
                  <Text className="ml-1 text-sm font-medium text-blue-600">Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center rounded-md bg-red-50 px-3 py-2"
                  onPress={() => onDelete?.(donation)}
                  activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  <Text className="ml-1 text-sm font-medium text-red-600">Excluir</Text>
                </TouchableOpacity>
              </>
            )}

            {canApprove && status === 'pendente' && (
              <>
                <TouchableOpacity
                  className="flex-row items-center rounded-md bg-green-50 px-3 py-2"
                  onPress={() => onApprove?.(donation)}
                  activeOpacity={0.7}>
                  <Ionicons name="checkmark-outline" size={16} color="#10b981" />
                  <Text className="ml-1 text-sm font-medium text-green-600">Aprovar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="flex-row items-center rounded-md bg-red-50 px-3 py-2"
                  onPress={() => onReject?.(donation)}
                  activeOpacity={0.7}>
                  <Ionicons name="close-outline" size={16} color="#ef4444" />
                  <Text className="ml-1 text-sm font-medium text-red-600">Rejeitar</Text>
                </TouchableOpacity>
              </>
            )}

            {canMarkCollected && status === 'aprovado' && (
              <TouchableOpacity
                className="flex-row items-center rounded-md bg-gray-50 px-3 py-2"
                onPress={() => onMarkCollected?.(donation)}
                activeOpacity={0.7}>
                <Ionicons name="cube-outline" size={16} color="#6b7280" />
                <Text className="ml-1 text-sm font-medium text-gray-600">Marcar Coletado</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};
