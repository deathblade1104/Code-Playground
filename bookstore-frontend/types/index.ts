// Types matching backend DTOs

export enum Role {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN'
}

export enum Genre {
  FICTION = 'FICTION',
  NON_FICTION = 'NON_FICTION',
  SCIENCE = 'SCIENCE',
  HISTORY = 'HISTORY',
  TECHNOLOGY = 'TECHNOLOGY',
  OTHER = 'OTHER'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  name: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
}

export interface CreateAuthorRequest {
  name: string;
  bio?: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  price: number;
  stock: number;
  author: Author;
  genre: Genre;
  isbn: string;
  s3Path: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookRequest {
  title: string;
  description?: string;
  price: number;
  stock: number;
  authorId: number;
  genre: Genre;
  isbn: string;
  s3Path: string;
}

export interface PresignedUrlRequest {
  fileName: string;
}

export interface PresignedUrlResponse {
  presignedUrl: string;
  s3Path: string;
  expirationMinutes: number;
}

export interface CartItem {
  itemId: number;
  bookId: number;
  bookTitle: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  cartId: number;
  userId: number;
  isActive: boolean;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface EditCartRequest {
  items: {
    bookId: number;
    quantity: number;
  }[];
}

export interface OrderItem {
  bookId: number;
  bookTitle: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  orderId: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

export interface AdminDashboardStats {
  totalBooks: number;
  totalOrders: number;
  totalUsers: number;
  outOfStockBooks: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
}

export interface LowStockBook {
  bookId: number;
  title: string;
  currentStock: number;
  threshold: number;
  lastRestockDate?: string;
}

export interface RecentOrder {
  orderNumber: string;
  userId: number;
  userEmail: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface StockHistory {
  bookId: number;
  bookTitle: string;
  previousStock: number;
  newStock: number;
  delta: number;
  updatedAt: string;
}

export interface AdminDashboardResponse {
  stats: AdminDashboardStats;
  lowStockBooks: LowStockBook[];
  recentOrders: RecentOrder[];
  stockHistory: StockHistory[];
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface ISBNCheckResponse {
  isbn: string;
  mightExist: boolean;
  definitelyExists: boolean;
  actuallyExists: boolean;
  message: string;
  isFalsePositive: boolean;
}

