declare module '../../contexts/AuthContext' {
  interface User {
    _id: string;
    email: string;
    name: string;
    role: 'admin' | 'tutor' | 'user';
    status: 'active' | 'inactive';
  }

  interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (credentials: { email: string; password: string }) => Promise<User>;
    register: (userData: Partial<User>) => Promise<User>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isAdmin: boolean;
    isTutor: boolean;
  }

  export const useAuth: () => AuthContextType;
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
} 