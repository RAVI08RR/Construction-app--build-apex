const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cmqmc4vsy0oezygfabuvi19e4.fra.prisma.build';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

export const api = {
  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  setToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  },

  clearToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getUser: () => {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  },

  setUser: (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Interactive Demo override roles
  getActiveRole: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('demo_role') || null;
    }
    return null;
  },

  setActiveRole: (role: string | null) => {
    if (typeof window !== 'undefined') {
      if (role) localStorage.setItem('demo_role', role);
      else localStorage.removeItem('demo_role');
    }
  },

  request: async <T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> => {
    const token = api.getToken();
    const activeRole = api.getActiveRole();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (activeRole) {
      headers['x-demo-role'] = activeRole;
    }

    try {
      const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        data = { message: text };
      }

      if (!response.ok) {
        return {
          error: data.message || 'Something went wrong',
          status: response.status,
        };
      }

      return {
        data: data as T,
        status: response.status,
      };
    } catch (error: any) {
      return {
        error: error.message || 'Network error',
        status: 500,
      };
    }
  },

  get: <T>(path: string, options?: RequestInit) => api.request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: any, options?: RequestInit) =>
    api.request<T>(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body?: any, options?: RequestInit) =>
    api.request<T>(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: any, options?: RequestInit) =>
    api.request<T>(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string, options?: RequestInit) => api.request<T>(path, { ...options, method: 'DELETE' }),
};
