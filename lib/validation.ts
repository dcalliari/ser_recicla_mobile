export interface LoginCredentials {
  username: string;
  password: string;
  otp_code?: string;
}

export interface MatriculaCredentials {
  matricula: string;
}

export interface FinalizarCadastroCredentials {
  matricula: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  password_confirm: string;
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

export const validateMatriculaCredentials = (
  data: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.matricula || data.matricula.trim() === '') {
    errors.matricula = 'Matrícula é obrigatória';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateFinalizarCadastroCredentials = (
  data: any
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.first_name || data.first_name.trim() === '') {
    errors.first_name = 'Nome é obrigatório';
  }

  if (!data.last_name || data.last_name.trim() === '') {
    errors.last_name = 'Sobrenome é obrigatório';
  }

  if (!data.email || data.email.trim() === '') {
    errors.email = 'E-mail é obrigatório';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'E-mail inválido';
  }

  if (!data.username || data.username.trim() === '') {
    errors.username = 'Nome de usuário é obrigatório';
  } else if (data.username.length < 3) {
    errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Senha é obrigatória';
  } else if (data.password.length < 6) {
    errors.password = 'Senha deve ter pelo menos 6 caracteres';
  }

  if (!data.password_confirm || data.password_confirm.trim() === '') {
    errors.password_confirm = 'Confirmação de senha é obrigatória';
  } else if (data.password !== data.password_confirm) {
    errors.password_confirm = 'Senhas não coincidem';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
