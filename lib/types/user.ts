import type { Turma, Unidade, Universidade } from './institutional';

export type UserRole =
  | 'administrador'
  | 'coordenador'
  | 'chefe_turma'
  | 'aluno'
  | 'ponto_coleta'
  | 'desconhecido';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  universidade: string | null;
  unidade: string | null;
  turma: string | null;
}

export const UsuarioPerfil = {
  ADMIN_UNI: 'Administrador',
  COORD: 'Coordenador',
  CHEFE: 'Chefe de Turma',
  ALUNO: 'Aluno',
  PONTO: 'Ponto de Coleta',
} as const;
export type UsuarioPerfilType = keyof typeof UsuarioPerfil;

export interface Usuario {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  matricula: string;
  perfil: UsuarioPerfilType;
  turma: Turma;
  unidade?: Unidade;
  universidade?: Universidade;
}

export interface UsuarioFormData {
  first_name: string;
  last_name: string;
  email: string;
  matricula: string;
  perfil: string;
  turma: string;
}

export interface UsuarioCreateData {
  first_name: string;
  last_name: string;
  email: string;
  matricula: string;
  perfil: UsuarioPerfilType;
  turma_id: number;
}

export interface UsuarioUpdateData extends Partial<Usuario> {
  id: number;
}
