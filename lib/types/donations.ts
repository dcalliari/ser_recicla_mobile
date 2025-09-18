import type { Usuario } from './user';
import type { Turma } from './institutional';

export interface PedidoDoacao {
  id: number;
  codigo: string;
  turma: Turma;
  chefe_responsavel: Usuario;
  alunos?: Usuario[];
  status?: 'pendente' | 'aprovado' | 'rejeitado' | 'coletado';
  data_criacao?: string;
  data_atualizacao?: string;
  observacoes?: string;
}

export interface PedidoDoacaoFormData {
  codigo: string;
  turma: string;
  chefe_responsavel: string;
  alunos: string[];
  status: string;
  observacoes?: string;
}

export interface PedidoDoacaoCreateData {
  codigo: string;
  turma_id: number;
  chefe_responsavel_id: number;
  alunos_ids?: number[];
  status?: string;
  observacoes?: string;
}

export interface PedidoDoacaoUpdateData extends Partial<PedidoDoacao> {
  id: number;
}

export type DonationStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'coletado';

export const DonationStatusLabels: Record<DonationStatus, string> = {
  pendente: 'Pendente',
  aprovado: 'Aprovado',
  rejeitado: 'Rejeitado',
  coletado: 'Coletado',
} as const;

export const DonationStatusColors: Record<DonationStatus, string> = {
  pendente: '#f59e0b', // amber-500
  aprovado: '#10b981', // emerald-500
  rejeitado: '#ef4444', // red-500
  coletado: '#6b7280', // gray-500
} as const;
