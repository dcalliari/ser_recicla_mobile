export interface TokenResponse {
  access: string;
}

/**
 * Base API error class for all API-related errors
 */
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Interface for validation errors returned by the Django API
 * Maps field names to an array of error messages
 */
export interface ValidationErrors {
  [field: string]: string[];
}

/**
 * Validation error class for Django REST Framework validation errors (HTTP 400)
 * Contains field-specific error messages
 */
export class APIValidationError extends APIError {
  public errors: ValidationErrors;

  constructor(message: string, errors: ValidationErrors, status?: number) {
    super(message, status);
    this.name = 'APIValidationError';
    this.errors = errors;
  }
}

class APIService {
  public accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private baseURL: string = 'https://ser-recicla-hml.vsl-dev.me/api';

  /**
   * Retries a request with a refreshed access token
   * @param url - Full URL to retry
   * @param init - Request init options
   * @returns Response object
   * @throws {APIError} When network request fails
   */
  private async retryRequestWithRefreshedToken(url: string, init: RequestInit): Promise<Response> {
    // Falhou a atualização do token (token expirado/inválido/não encontrado)
    if (!(await this.refreshToken())) {
      this.accessToken = null;
      if (typeof window !== 'undefined') {
        console.error('Sessão expirada, redirecionando para login');
        window.location.href = '/login';
      }
    }

    const newHeaders = {
      ...init.headers,
      Authorization: `Bearer ${this.accessToken}`,
    };

    return fetch(url, {
      method: init.method,
      headers: newHeaders,
      body: init.body,
      credentials: 'include',
    });
  }

  /**
   * Makes an HTTP request to the API
   * @param url - API endpoint URL (relative to baseURL)
   * @param options - Fetch request options
   * @returns Promise resolving to response data
   * @throws {APIError} When network request fails or server returns error status
   * @throws {APIValidationError} When server returns HTTP 400 with field validation errors
   */
  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const fullUrl = this.baseURL + url;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : Array.isArray(options.headers)
          ? Object.fromEntries(options.headers)
          : options.headers || {}),
    };
    if (this.accessToken && !url.includes('/refresh')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const reqOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    let response: Response;
    try {
      response = await fetch(fullUrl, reqOptions);
      if (response.status === 401 && !url.includes('/refresh') && !url.includes('/login')) {
        response = await this.retryRequestWithRefreshedToken(fullUrl, reqOptions);
      }
    } catch (error) {
      throw new APIError(
        `Erro de rede: ${error instanceof Error ? error.message : 'Desconhecido'}`
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle Django DRF validation errors (400 status with field errors)
      if (response.status === 400 && errorData && typeof errorData === 'object') {
        // Check if it's a validation error format (object with field keys)
        const hasFieldErrors = Object.keys(errorData).some(
          (key) => Array.isArray(errorData[key]) || typeof errorData[key] === 'string'
        );

        if (hasFieldErrors) {
          // Normalize errors to string arrays
          const normalizedErrors: ValidationErrors = {};
          for (const [field, messages] of Object.entries(errorData)) {
            normalizedErrors[field] = Array.isArray(messages)
              ? (messages as string[])
              : [messages as string];
          }

          throw new APIValidationError('Validação falhou', normalizedErrors, response.status);
        }
      }

      throw new APIError(
        errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
        response.status
      );
    }

    return await response.json().catch(() => undefined);
  }

  /**
   * Refreshes the access token using the refresh token stored in cookies
   * @returns Promise resolving to true if refresh was successful, false otherwise
   */
  private async refreshToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    const res = await this.refreshPromise;

    this.refreshPromise = null;
    return res;
  }

  /**
   * Performs the actual token refresh request
   * @returns Promise resolving to true if refresh was successful, false otherwise
   */
  private async performRefresh(): Promise<boolean> {
    try {
      const response = await this.post<TokenResponse>('/v1/auth/refresh/');
      this.accessToken = response.access;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the current authentication is valid by attempting to refresh the token
   * @returns Promise resolving to true if authentication is valid, false otherwise
   */
  public async checkAuth(): Promise<boolean> {
    const valid = await this.refreshToken();
    if (!valid) this.accessToken = null;

    return valid;
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param url - API endpoint URL (relative to baseURL)
   * @returns Promise resolving to response data
   * @throws {APIError} When network request fails or server returns error status
   * @throws {APIValidationError} When server returns HTTP 400 with field validation errors
   */
  public async get<T>(url: string): Promise<T> {
    return await this.makeRequest<T>(url, {
      method: 'GET',
    });
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param url - API endpoint URL (relative to baseURL)
   * @param data - Request body data (will be JSON stringified)
   * @returns Promise resolving to response data
   * @throws {APIError} When network request fails or server returns error status
   * @throws {APIValidationError} When server returns HTTP 400 with field validation errors
   */
  public async post<T>(url: string, data?: unknown): Promise<T> {
    return await this.makeRequest<T>(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Makes a PUT request to the specified endpoint
   * @param url - API endpoint URL (relative to baseURL)
   * @param data - Request body data (will be JSON stringified)
   * @returns Promise resolving to response data
   * @throws {APIError} When network request fails or server returns error status
   * @throws {APIValidationError} When server returns HTTP 400 with field validation errors
   */
  public async put<T>(url: string, data?: unknown): Promise<T> {
    return await this.makeRequest<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param url - API endpoint URL (relative to baseURL)
   * @returns Promise resolving to response data
   * @throws {APIError} When network request fails or server returns error status
   * @throws {APIValidationError} When server returns HTTP 400 with field validation errors
   */
  public async delete<T>(url: string): Promise<T> {
    return await this.makeRequest<T>(url, {
      method: 'DELETE',
    });
  }
}

/**
 * APIService provides methods for making HTTP requests to the backend API.
 * It includes methods for GET, POST, PUT, DELETE requests,
 * and handles authentication token management.
 * It automatically refreshes the access token when needed
 * and retries requests with the new token.
 */
export const api = new APIService();
