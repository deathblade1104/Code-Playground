import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  Book,
  CreateBookRequest,
  CartResponse,
  EditCartRequest,
  OrderResponse,
  PresignedUrlRequest,
  PresignedUrlResponse,
  AdminDashboardResponse,
  LowStockBook,
  ISBNCheckResponse,
  PageResponse,
  Author,
  CreateAuthorRequest,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Log API URL in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    });

    // Handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Enhanced error logging
        if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
          console.error('Network Error:', {
            message: error.message,
            code: error.code,
            baseURL: API_BASE_URL,
            url: error.config?.url,
            fullURL: `${API_BASE_URL}${error.config?.url}`,
          });
        }

        if (error.response?.status === 401) {
          if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/signup', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/api/auth/login', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/api/auth/logout');
  }

  // Book endpoints
  async getBooks(page = 0, size = 20, includeOutOfStock = false): Promise<PageResponse<Book>> {
    const response = await this.client.get<PageResponse<Book>>('/api/books', {
      params: { page, size, includeOutOfStock },
    });
    return response.data;
  }

  async getBook(id: number): Promise<Book> {
    // Note: Backend doesn't have GET /api/books/{id} endpoint
    // This is a workaround - fetches all books and finds the one with matching ID
    // TODO: Add GET /api/books/{id} endpoint to backend
    const response = await this.client.get<PageResponse<Book>>('/api/books', {
      params: { page: 0, size: 1000 },
    });
    const book = response.data.content?.find((b) => b.id === id);
    if (!book) {
      throw new Error('Book not found');
    }
    return book;
  }

  async createBook(data: CreateBookRequest): Promise<Book> {
    const response = await this.client.post<Book>('/api/books', data);
    return response.data;
  }

  async updateStock(bookId: number, delta: number): Promise<Book> {
    const response = await this.client.patch<Book>(`/api/books/${bookId}/stock`, null, {
      params: { delta },
    });
    return response.data;
  }

  async searchBooks(query: string): Promise<Book[]> {
    const response = await this.client.get<Book[]>('/api/books/search', {
      params: { query },
    });
    return response.data;
  }

  async getPresignedUrl(data: PresignedUrlRequest): Promise<PresignedUrlResponse> {
    const response = await this.client.post<PresignedUrlResponse>(
      '/api/books/covers/upload',
      data
    );
    return response.data;
  }

  async checkISBN(isbn: string): Promise<ISBNCheckResponse> {
    const response = await this.client.get<ISBNCheckResponse>('/api/books/isbn/check', {
      params: { isbn },
    });
    return response.data;
  }

  // Cart endpoints
  async getCart(): Promise<CartResponse> {
    const response = await this.client.get<CartResponse>('/api/cart');
    return response.data;
  }

  async editCart(data: EditCartRequest): Promise<CartResponse> {
    const response = await this.client.post<CartResponse>('/api/cart/edit', data);
    return response.data;
  }

  async removeFromCart(itemId: number): Promise<CartResponse> {
    const response = await this.client.delete<CartResponse>(`/api/cart/items/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<void> {
    await this.client.delete('/api/cart');
  }

  // Checkout & Orders
  async checkout(): Promise<OrderResponse> {
    const response = await this.client.post<OrderResponse>('/api/checkout');
    return response.data;
  }

  async getOrders(): Promise<OrderResponse[]> {
    const response = await this.client.get<OrderResponse[]>('/api/orders');
    return response.data;
  }

  async getOrder(orderNumber: string): Promise<OrderResponse> {
    const response = await this.client.get<OrderResponse>(`/api/orders/${orderNumber}`);
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<AdminDashboardResponse> {
    const response = await this.client.get<AdminDashboardResponse>('/api/admin/dashboard');
    return response.data;
  }

  async getLowStockBooks(threshold = 10, limit = 20): Promise<LowStockBook[]> {
    const response = await this.client.get<LowStockBook[]>('/api/admin/dashboard/low-stock', {
      params: { threshold, limit },
    });
    return response.data;
  }

  // Author endpoints
  async createAuthor(data: CreateAuthorRequest): Promise<Author> {
    const response = await this.client.post<Author>('/api/authors', data);
    return response.data;
  }

  async searchAuthors(name?: string): Promise<Author[]> {
    const response = await this.client.get<Author[]>('/api/authors/search', {
      params: name ? { name } : {},
    });
    return response.data;
  }

  async getAllAuthors(): Promise<Author[]> {
    const response = await this.client.get<Author[]>('/api/authors');
    return response.data;
  }

  async getAuthorById(id: number): Promise<Author> {
    const response = await this.client.get<Author>(`/api/authors/${id}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();

