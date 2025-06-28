import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse } from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  }

  // Generic API methods
  async get<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url);
    return response.data;
  }

  async post<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(url, data);
    return response.data;
  }

  async put<T>(url: string, data?: any): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data);
    return response.data;
  }

  async delete<T>(url: string): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url);
    return response.data;
  }

  // Auth methods
  async verifyToken(token: string): Promise<ApiResponse> {
    return this.post('/api/auth/verify-token', { token });
  }

  async getCurrentUser(): Promise<ApiResponse> {
    return this.get('/api/auth/user');
  }

  async loginWithEmail(email: string, password: string): Promise<ApiResponse> {
    return this.post('/api/auth/login', { email, password });
  }

  async register(name: string, email: string, password: string): Promise<ApiResponse> {
    return this.post('/api/auth/register', { name, email, password });
  }

  async logout(): Promise<ApiResponse> {
    return this.get('/api/auth/logout');
  }

  // Customer methods
  async getCustomers(): Promise<any> {
    return this.get('/api/customers');
  }

  async getCustomer(id: string): Promise<any> {
    return this.get(`/api/customers/${id}`);
  }

  async createCustomer(data: any): Promise<any> {
    return this.post('/api/customers', data);
  }

  async updateCustomer(id: string, data: any): Promise<any> {
    return this.put(`/api/customers/${id}`, data);
  }

  async deleteCustomer(id: string): Promise<any> {
    return this.delete(`/api/customers/${id}`);
  }

  // Order methods
  async getOrders(): Promise<any> {
    return this.get('/api/orders');
  }

  async getOrder(id: string): Promise<any> {
    return this.get(`/api/orders/${id}`);
  }

  async getOrdersByCustomer(customerId: string): Promise<any> {
    return this.get(`/api/orders/customer/${customerId}`);
  }

  async createOrder(data: any): Promise<any> {
    return this.post('/api/orders', data);
  }

  async updateOrder(id: string, data: any): Promise<any> {
    return this.put(`/api/orders/${id}`, data);
  }

  // Campaign methods
  async getCampaigns(): Promise<any> {
    return this.get('/api/campaigns');
  }

  async getCampaign(id: string): Promise<any> {
    return this.get(`/api/campaigns/${id}`);
  }

  async createCampaign(data: any): Promise<any> {
    return this.post('/api/campaigns', data);
  }

  async previewAudience(segments: any): Promise<any> {
    return this.post('/api/campaigns/segments/preview', { segments });
  }

  async generateCampaignInsight(id: string): Promise<any> {
    return this.post(`/api/campaigns/${id}/insight`);
  }
}

export const apiClient = new ApiClient();
export default apiClient;