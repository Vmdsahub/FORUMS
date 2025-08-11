export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birthDate?: string;
  role?: "admin" | "user";
  points?: number;
  badges?: string[]; // IDs dos badges conquistados
  emailConfirmed?: boolean;
  acceptNewsletter?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  captcha: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  captcha: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ErrorResponse {
  message: string;
  errors?: string[];
}
