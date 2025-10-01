import axios, { AxiosError } from "axios";

// ================== Types ==================
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
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

interface APIError {
  error: string;
}

// ================== API Functions ==================

// Login
export const loginUser = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(
      "/api/auth/signin",
      credentials
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<APIError>;
    throw new Error(error.response?.data?.error || "Login failed");
  }
};

// Signup
export const signupUser = async (
  credentials: SignupCredentials
): Promise<AuthResponse> => {
  try {
    const userData = {
      name: `${credentials.firstName} ${credentials.lastName}`,
      email: credentials.email,
      password: credentials.password,
      newsletter: credentials.newsletter ?? false,
    };

    const response = await axios.post<AuthResponse>(
      "/api/auth/signup",
      userData
    );
    return response.data;
  } catch (err) {
    const error = err as AxiosError<APIError>;
    throw new Error(error.response?.data?.error || "Signup failed");
  }
};

// Google login
export const loginWithGoogle = async (token: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>("/api/auth/google", {
      token,
    });
    return response.data;
  } catch (err) {
    const error = err as AxiosError<APIError>;
    throw new Error(error.response?.data?.error || "Google login failed");
  }
};

// ================== Token Management ==================
export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token");
  }
  return null;
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    delete axios.defaults.headers.common["Authorization"];
  }
};
