import { useAuthStore } from '~/store/store';
import { UserRole } from '~/lib/types/user';

export const usePermissions = () => {
  const { user } = useAuthStore();

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role || 'desconhecido');
  };

  const isStudent = (): boolean => {
    return hasRole('aluno');
  };

  const isAdmin = (): boolean => {
    return hasRole('administrador');
  };

  const isCoordinator = (): boolean => {
    return hasRole('coordenador');
  };

  const isClassLeader = (): boolean => {
    return hasRole('chefe_turma');
  };

  const isCollectionPoint = (): boolean => {
    return hasRole('ponto_coleta');
  };

  const canAccessInstitutional = (): boolean => {
    return !isStudent();
  };

  const canAccessDonations = (): boolean => {
    return !isStudent();
  };

  const canManageUsers = (): boolean => {
    return hasAnyRole(['administrador', 'coordenador']);
  };

  const canManageClasses = (): boolean => {
    return hasAnyRole(['administrador', 'coordenador', 'chefe_turma']);
  };

  return {
    user,
    hasRole,
    hasAnyRole,
    isStudent,
    isAdmin,
    isCoordinator,
    isClassLeader,
    isCollectionPoint,
    canAccessInstitutional,
    canAccessDonations,
    canManageUsers,
    canManageClasses,
  };
};
