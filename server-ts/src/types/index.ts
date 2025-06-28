import { Document, Types } from 'mongoose';
import { Request } from 'express';

// User/Customer Types
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  status: 'new' | 'active' | 'inactive';
  assignedAdmin: Types.ObjectId;
  orderCount: number;
  totalSpend: number;
  lastOrderDate?: Date;
  tags: string[];
  preferences: {
    newsletter: boolean;
    preferredChannels: ('email' | 'sms' | 'push')[];
  };
  campaigns: Types.ObjectId[];
  googleId?: string;
  role: 'user' | 'admin';
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  updateProfile(profileData: Partial<IUser>): Promise<IUser>;
}

// Admin Types
export interface IAdmin extends Document {
  _id: Types.ObjectId;
  googleId?: string;
  role: 'admin';
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  lastLogin: Date;
  createdAt: Date;
  assignedUsers: Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Order Types
export interface IOrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  orderNumber: string;
  items: IOrderItem[];
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
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Campaign Types
export interface IRule {
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
  value: string;
}

export interface IRuleGroup {
  operator: 'AND' | 'OR';
  rules: IRule[];
}

export interface ICampaignStats {
  sent: number;
  failed: number;
  audienceSize: number;
}

export interface ICampaign extends Document {
  _id: Types.ObjectId;
  name: string;
  createdBy: Types.ObjectId;
  segments: IRuleGroup[];
  audienceSize: number;
  audienceUserIds: Types.ObjectId[];
  scheduledAt?: Date;
  stats: ICampaignStats;
  createdAt: Date;
  updatedAt: Date;
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user: IAdmin;
}

// RabbitMQ Message Types
export interface CustomerCreateMessage {
  name: string;
  email: string;
  phone?: string;
  status?: 'new' | 'active' | 'inactive';
  assignedAdmin: string;
}

export interface CustomerUpdateMessage {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  status?: 'new' | 'active' | 'inactive';
  assignedAdmin: string;
}

export interface OrderCreateMessage {
  user: string;
  orderNumber?: string;
  items: IOrderItem[];
  totalAmount: number;
  status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingAddress?: any;
  deliveryDate?: string;
  notes?: string;
}

export interface OrderUpdateMessage {
  id: string;
  [key: string]: any;
}

export interface CampaignCreateMessage {
  campaignId: string;
  name: string;
  rules: IRuleGroup[];
  audienceSize: number;
  userIds: string[];
  audienceUserIds: string[];
  scheduledAt?: string;
  createdBy: string;
  stats: ICampaignStats;
}

// JWT Payload Type
export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
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

// Environment Variables Type
export interface EnvConfig {
  NODE_ENV: string;
  PORT: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  SESSION_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  RABBITMQ_URL: string;
  CLIENT_URL: string;
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  TOGETHER_API_KEY?: string;
}