import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { DonationStatus } from '~/lib/types/donations';
import { DonationStatusLabels, DonationStatusColors } from '~/lib/types/donations';

interface DonationFiltersProps {
  selectedStatus: DonationStatus | 'todos';
  onStatusChange: (status: DonationStatus | 'todos') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const statusOptions: { key: DonationStatus | 'todos'; label: string; icon: string }[] = [
  { key: 'todos', label: 'Todos', icon: 'list-outline' },
  { key: 'pendente', label: DonationStatusLabels.pendente, icon: 'time-outline' },
  { key: 'aprovado', label: DonationStatusLabels.aprovado, icon: 'checkmark-circle-outline' },
  { key: 'rejeitado', label: DonationStatusLabels.rejeitado, icon: 'close-circle-outline' },
  { key: 'coletado', label: DonationStatusLabels.coletado, icon: 'cube-outline' },
];

export const DonationFilters: React.FC<DonationFiltersProps> = ({
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <View className="mb-4">
      {/* Search Input */}
      <View className="mb-4">
        <View className="flex-row items-center rounded-lg border border-gray-300 bg-white px-3 py-2">
          <Ionicons name="search-outline" size={20} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={onSearchChange}
            placeholder="Buscar por código, turma ou responsável..."
            className="ml-2 flex-1 text-base text-gray-900"
            placeholderTextColor="#9ca3af"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => onSearchChange('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={20} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Status Filters */}
      <Text className="mb-2 text-sm font-medium text-gray-700">Filtrar por status:</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerStyle={{ paddingHorizontal: 0 }}>
        {statusOptions.map((option, index) => {
          const isSelected = selectedStatus === option.key;
          const statusColor =
            option.key !== 'todos' ? DonationStatusColors[option.key as DonationStatus] : '#6b7280';

          return (
            <TouchableOpacity
              key={option.key}
              className={`mr-3 flex-row items-center rounded-full px-4 py-2 ${
                isSelected ? 'border-2 bg-white shadow-sm' : 'bg-gray-100'
              }`}
              style={isSelected ? { borderColor: statusColor } : {}}
              onPress={() => onStatusChange(option.key)}
              activeOpacity={0.7}>
              <Ionicons
                name={option.icon as any}
                size={16}
                color={isSelected ? statusColor : '#6b7280'}
              />
              <Text
                className={`ml-2 text-sm font-medium ${isSelected ? '' : 'text-gray-600'}`}
                style={isSelected ? { color: statusColor } : {}}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
