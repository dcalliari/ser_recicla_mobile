import { api, TokenResponse } from './api';
import { AuthUser } from './types/user';
import type { LoginCredentials } from './validation';

export class AuthService {
  /**
   * Logs in the user with the provided credentials.
   * @param credentials - The user's login credentials.
   * @throws {APIError | APIValidationError} If the request fails or validation errors occur.
   */
  public async login(credentials: LoginCredentials): Promise<void> {
    try {
      const res = await api.post<TokenResponse>('/v1/auth/login/', credentials);
      api.accessToken = res.access;
    } catch (error) {
      api.accessToken = null;
      throw error; // Re-throw to handle in the calling context
    }
  }

  /**
   * Logs out the user by clearing the access token.
   * @throws {APIError | APIValidationError} If the request fails.
   */
  public async logout(): Promise<void> {
    try {
      await api.post('/v1/auth/logout/');
    } catch (error) {
      throw error; // Re-throw to handle in the calling context
    } finally {
      api.accessToken = null;
    }
  }

  /**
   * Checks if the user is authenticated by verifying the access token.
   * @throws {APIError | APIValidationError} If the request fails or validation errors occur.
   * @returns {Promise<AuthUser>} The authenticated user's information.
   */
  async getUserInfo(): Promise<AuthUser> {
    return await api.get<AuthUser>('/v1/auth/me/');
  }

  /**
   * Updates the user's information.
   * @param data - Partial user data to update.
   * @throws {APIError | APIValidationError} If the request fails or validation errors occur.
   * @returns {Promise<AuthUser>} The updated user information.
   */
  async updateUserInfo(data: Partial<Omit<AuthUser, 'id'>>): Promise<AuthUser> {
    return await api.put<AuthUser>('/v1/auth/me/', data);
  }

  /**
   * Validates a matricula number.
   * @param matricula - The matricula number to validate.
   * @throws {APIError | APIValidationError} If the request fails or validation errors occur.
   * @returns {Promise<{valid: boolean, turma?: string | null, curso?: string | null, message?: string}>} The validation result.
   */
  async validateMatricula(
    matricula: string
  ): Promise<{ valid: boolean; turma?: string | null; curso?: string | null; message?: string }> {
    return await api.post('/v1/auth/validar-matricula/', { matricula });
  }

  /**
   * Finalizes the user registration.
   * @param data - The registration data.
   * @throws {APIError | APIValidationError} If the request fails or validation errors occur.
   * @returns {Promise<TokenResponse>} The authentication tokens.
   */
  async finalizarCadastro(data: {
    matricula: string;
    first_name: string;
    last_name: string;
    email: string;
    username: string;
    password: string;
    password_confirm: string;
  }): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>('/v1/auth/finalizar-cadastro/', data);
    api.accessToken = response.access;
    return response;
  }
}

/**
 * AuthService provides methods for user authentication and management.
 * It includes login, logout, fetching user info, and updating user details.
 * It uses the api module for making HTTP requests to the backend.
 */
export const auth = new AuthService();
