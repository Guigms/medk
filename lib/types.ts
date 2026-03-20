// Tipos do sistema

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  featured?: boolean;
  discount?: number;
  requiresPrescription?: boolean;
  expiryDate?: string;
  clicks?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link?: string;
  active: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}