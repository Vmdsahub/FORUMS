import { RequestHandler } from "express";
import { z } from "zod";
import { LoginRequest, RegisterRequest, AuthResponse, ErrorResponse, User } from "@shared/auth";

// Simple in-memory storage for demo purposes
// In production, use a proper database
const users: Map<string, { id: string; name: string; email: string; password: string }> = new Map();
const tokens: Map<string, string> = new Map(); // token -> userId

// Validation schemas
const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  captcha: z.string().min(1, "Captcha é obrigatório"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  captcha: z.string().min(1, "Captcha é obrigatório"),
});

// Simple token generation
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Simple password hashing (use bcrypt in production)
function hashPassword(password: string): string {
  // This is not secure - use bcrypt or similar in production
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password: string, hash: string): boolean {
  return Buffer.from(password).toString('base64') === hash;
}

// Middleware to verify authentication
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acesso requerido' });
  }

  const userId = tokens.get(token);
  if (!userId) {
    return res.status(403).json({ message: 'Token inválido' });
  }

  const user = users.get(userId);
  if (!user) {
    return res.status(403).json({ message: 'Usuário não encontrado' });
  }

  req.user = {
    id: user.id,
    name: user.name,
    email: user.email
  };
  
  next();
};

export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email, password, captcha } = loginSchema.parse(req.body);

    // For demo purposes, we don't validate captcha server-side
    // In production, you would validate the captcha here

    // Find user by email
    const user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user || !verifyPassword(password, user.password)) {
      return res.status(401).json({ 
        message: 'Email ou senha incorretos' 
      } as ErrorResponse);
    }

    // Generate token
    const token = generateToken();
    tokens.set(token, user.id);

    const response: AuthResponse = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token
    };

    res.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors.map(e => e.message)
      } as ErrorResponse);
    }
    
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor' 
    } as ErrorResponse);
  }
};

export const handleRegister: RequestHandler = (req, res) => {
  try {
    const { name, email, password, captcha } = registerSchema.parse(req.body);

    // For demo purposes, we don't validate captcha server-side
    // In production, you would validate the captcha here

    // Check if user already exists
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      return res.status(409).json({ 
        message: 'Email já está em uso' 
      } as ErrorResponse);
    }

    // Create new user
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    const newUser = {
      id: userId,
      name,
      email,
      password: hashPassword(password)
    };

    users.set(userId, newUser);

    // Generate token
    const token = generateToken();
    tokens.set(token, userId);

    const response: AuthResponse = {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      },
      token
    };

    res.status(201).json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: 'Dados inválidos',
        errors: error.errors.map(e => e.message)
      } as ErrorResponse);
    }
    
    console.error('Register error:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor' 
    } as ErrorResponse);
  }
};

export const handleMe: RequestHandler = (req, res) => {
  // This will only be called if authenticateToken middleware passes
  res.json(req.user);
};

export const handleLogout: RequestHandler = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    tokens.delete(token);
  }

  res.json({ message: 'Logout realizado com sucesso' });
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
