import { api } from '../api';
import type {
  PedidoDoacao,
  PedidoDoacaoCreateData,
  PedidoDoacaoUpdateData,
} from '../types/donations';

export const donationsService = {
  // Buscar todos os pedidos de doação
  async getAll(): Promise<PedidoDoacao[]> {
    try {
      const response = await api.get<PedidoDoacao[]>('/v1/recycling/pedido-doacao/');
      return response;
    } catch (error) {
      console.error('Erro ao buscar pedidos de doação:', error);
      throw error;
    }
  },

  // Buscar um pedido de doação específico
  async getById(id: number): Promise<PedidoDoacao> {
    try {
      const response = await api.get<PedidoDoacao>(`/v1/recycling/pedido-doacao/${id}/`);
      return response;
    } catch (error) {
      console.error(`Erro ao buscar pedido de doação ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo pedido de doação
  async create(data: PedidoDoacaoCreateData): Promise<PedidoDoacao> {
    try {
      const response = await api.post<PedidoDoacao>('/v1/recycling/pedido-doacao/', data);
      return response;
    } catch (error) {
      console.error('Erro ao criar pedido de doação:', error);
      throw error;
    }
  },

  // Atualizar um pedido de doação
  async update(id: number, data: Partial<PedidoDoacaoUpdateData>): Promise<PedidoDoacao> {
    try {
      const response = await api.put<PedidoDoacao>(`/v1/recycling/pedido-doacao/${id}/`, data);
      return response;
    } catch (error) {
      console.error(`Erro ao atualizar pedido de doação ${id}:`, error);
      throw error;
    }
  },

  // Deletar um pedido de doação
  async delete(id: number): Promise<void> {
    try {
      await api.delete<void>(`/v1/recycling/pedido-doacao/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar pedido de doação ${id}:`, error);
      throw error;
    }
  },

  // Aprovar um pedido de doação
  async approve(id: number): Promise<PedidoDoacao> {
    try {
      const response = await api.patch<PedidoDoacao>(`/v1/recycling/pedido-doacao/${id}/`, {
        status: 'aprovado',
      });
      return response;
    } catch (error) {
      console.error(`Erro ao aprovar pedido de doação ${id}:`, error);
      throw error;
    }
  },

  // Rejeitar um pedido de doação
  async reject(id: number, observacoes?: string): Promise<PedidoDoacao> {
    try {
      const response = await api.patch<PedidoDoacao>(`/v1/recycling/pedido-doacao/${id}/`, {
        status: 'rejeitado',
        observacoes,
      });
      return response;
    } catch (error) {
      console.error(`Erro ao rejeitar pedido de doação ${id}:`, error);
      throw error;
    }
  },

  // Marcar como coletado
  async markAsCollected(id: number): Promise<PedidoDoacao> {
    try {
      const response = await api.patch<PedidoDoacao>(`/v1/recycling/pedido-doacao/${id}/`, {
        status: 'coletado',
      });
      return response;
    } catch (error) {
      console.error(`Erro ao marcar pedido de doação ${id} como coletado:`, error);
      throw error;
    }
  },

  // Buscar pedidos de doação por status
  async getByStatus(status: string): Promise<PedidoDoacao[]> {
    try {
      const response = await api.get<PedidoDoacao[]>(
        `/v1/recycling/pedido-doacao/?status=${status}`
      );
      return response;
    } catch (error) {
      console.error(`Erro ao buscar pedidos de doação com status ${status}:`, error);
      throw error;
    }
  },

  // Buscar pedidos de doação por turma
  async getByTurma(turmaId: number): Promise<PedidoDoacao[]> {
    try {
      const response = await api.get<PedidoDoacao[]>(
        `/v1/recycling/pedido-doacao/?turma=${turmaId}`
      );
      return response;
    } catch (error) {
      console.error(`Erro ao buscar pedidos de doação da turma ${turmaId}:`, error);
      throw error;
    }
  },
};
