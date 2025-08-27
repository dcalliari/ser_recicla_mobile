export interface LoginCredentials {
  username: string;
  password: string;
  otp_code?: string;
}

export const validateLoginCredentials = (
  data: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.username || data.username.trim() === '') {
    errors.username = 'Usuário é obrigatório';
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Senha é obrigatória';
  }

  if (data.otp_code && data.otp_code.length < 6) {
    errors.otp_code = 'Codigo 2FA deve ter pelo menos 6 caracteres';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
