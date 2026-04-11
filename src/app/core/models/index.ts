// User model
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  isActive: boolean;
  phone?: string;
  twoFactorEnabled?: boolean;
  createdAt?: string;
}

// Product model
export type ProductCategory = 'supplements' | 'clothing' | 'accessories' | 'merch';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
  stock: number;
  imageUrl: string;
  isActive: boolean;
  details?: Record<string, any>;
  createdAt?: string;
}

// Order model
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  userId?: string;
  user?: User;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentReference?: string;
  paymentDetails?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Auth
export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface TwoFactorRequiredResponse {
  twoFactorRequired: true;
  userId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  name: string;
  password: string;
}

// Cart
export interface CartItem {
  product: Product;
  quantity: number;
}

// Dashboard
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Order[];
  lowStockProducts: Product[];
  ordersByStatus: Record<string, number>;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
