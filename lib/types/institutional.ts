export interface Universidade {
  id: number;
  nome: string;
  sigla: string;
  cidade: string;
  estado: string;
}

export type UniversidadeFormData = Omit<Universidade, 'id'>;
export type UniversidadeCreateData = Omit<Universidade, 'id'>;
export type UniversidadeUpdateData = Partial<Universidade> & { id: number };

export interface Unidade {
  id: number;
  nome: string;
  universidade: Universidade;
  campus: string;
}

export interface UnidadeFormData {
  nome: string;
  universidade: string;
  campus: string;
}

export interface UnidadeCreateData {
  nome: string;
  universidade_id: number;
  campus: string;
}

export interface UnidadeUpdateData extends Partial<Unidade> {
  id: number;
}

export interface Curso {
  id: number;
  nome: string;
  unidade: Unidade;
  universidade: Unidade['universidade'];
  duracao: string;
}

export interface CursoFormData {
  nome: string;
  duracao: string;
  universidade: string;
  unidade: string;
}

export interface CursoCreateData {
  nome: string;
  duracao: string;
  universidade_id: number;
  unidade_id: number;
}

export interface CursoUpdateData extends Partial<Curso> {
  id: number;
}

export interface Turma {
  id: number;
  nome: string;
  curso: Curso;
  ano: string;
  alunos: number;
}

export interface TurmaFormData {
  nome: string;
  ano: string;
  alunos: string;
  curso: string;
}

export interface TurmaCreateData {
  nome: string;
  ano: number;
  alunos: number;
  curso_id: number;
}

export interface TurmaUpdateData extends Partial<Turma> {
  id: number;
}
