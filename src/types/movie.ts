export interface Movie {
  id: string;
  title: string;
  year: number;
  genre: string;
  director: string;
  cast: string[];
  plot: string;
  facts: string[];
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieFormData {
  title: string;
  year: number;
  genre: string;
  director: string;
  cast: string;
  plot: string;
  facts: string;
  rating: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAuthenticated: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

