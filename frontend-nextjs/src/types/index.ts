// User/Customer Types
export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  status: 'new' | 'active' | 'inactive';
  assignedAdmin: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate?: string;
  tags: string[];
  preferences: {
    newsletter: boolean;
    preferredChannels: ('email' | 'sms' | 'push')[];
  };
  campaigns: Campaign[];
  googleId?: string;
  role: 'user' | 'admin';
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface Admin {
  _id: string;
  googleId?: string;
  role: 'admin';
  name: string;
  email: string;
  avatar?: string;
  lastLogin: string;
  createdAt: string;
  assignedUsers: string[];
}

// Order Types
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  user: User;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Campaign Types
export interface Rule {
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: string;
}

export interface RuleGroup {
  operator: 'AND' | 'OR';
  rules: Rule[];
}

export interface CampaignStats {
  sent: number;
  failed: number;
  audienceSize: number;
}

export interface Campaign {
  _id: string;
  name: string;
  createdBy: string;
  segments: RuleGroup[];
  audienceSize: number;
  audienceUserIds: string[];
  scheduledAt?: string;
  stats: CampaignStats;
  createdAt: string;
  updatedAt: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth Types
export interface AuthState {
  user: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

// Form Types
export interface CustomerFormData {
  name: string;
  email: string;
  phone?: string;
  status: 'new' | 'active' | 'inactive';
}

export interface OrderFormData {
  user: string;
  items: OrderItem[];
  totalAmount: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryDate?: string;
  notes?: string;
}

export interface CampaignFormData {
  name: string;
  segments: RuleGroup[];
  scheduledAt?: string;
}

// Filter and Sort Types
export interface FilterOptions {
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Component Props Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, order: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
}

// Navigation Types
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

// Error Types
export interface FormError {
  field: string;
  message: string;
}

export interface ValidationErrors {
  [key: string]: string;
}