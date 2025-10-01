import axios from 'axios';

// Types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  newsletter?: boolean;
}

// API functions
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/api/auth/signin', credentials);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Login failed');
  }
};

export const signupUser = async (credentials: SignupCredentials): Promise<AuthResponse> => {
  try {
    // Combine first and last name for the API
    const userData = {
      name: `${credentials.firstName} ${credentials.lastName}`,
      email: credentials.email,
      password: credentials.password,
    };
    
    const response = await axios.post('/api/auth/signup', userData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Signup failed');
  }
};

export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post('/api/auth/google', { token });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Google login failed');
  }
};

// Token management
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('auth_token');
  delete axios.defaults.headers.common['Authorization'];
};