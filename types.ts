
export enum UserRole {
  ADMIN = 'ADMIN',
  QUALITY = 'QUALITY',
  CLIENT = 'CLIENT'
}

export interface ClientOrganization {
  id: string;
  name: string;
  cnpj: string;
  status: 'ACTIVE' | 'INACTIVE';
  contractDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  clientId?: string; // If CLIENT, restricts access to this Organization ID
  status?: 'ACTIVE' | 'BLOCKED';
  department?: string; // New field
  lastLogin?: string;
}

export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
}

export interface FileMetadata {
  batchNumber?: string; // Nº da Corrida ou Lote
  productName?: string; // Ex: Aço SAE 1045
  invoiceNumber?: string; // Nota Fiscal
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
}

export interface FileNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  size?: string;
  updatedAt: string;
  ownerId?: string; // Which client does this belong to? (null = public/internal)
  tags?: string[]; // Metadata: e.g., "Lote 123", "SAE 1020"
  metadata?: FileMetadata; // Detailed industrial metadata
  isFavorite?: boolean; // UI State: Is this file favorited by the current user?
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  category: 'AUTH' | 'DATA' | 'SYSTEM' | 'SECURITY';
  target: string; 
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  status: 'SUCCESS' | 'FAILURE';
  ip: string;
  location: string;
  userAgent: string;
  device: string;
  metadata: Record<string, any>; // JSON stringifiable data for deep inspection
  requestId: string;
}

export interface LibraryFilters {
  startDate: string;
  endDate: string;
  status: 'ALL' | 'APPROVED' | 'PENDING';
  search: string;
}

export interface AppNotification {
  id: string;
  userId: string; // Target user (or 'ALL')
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  isRead: boolean;
  timestamp: string;
  link?: string; // Optional navigation link
}

export type TicketFlow = 'CLIENT_TO_QUALITY' | 'QUALITY_TO_ADMIN' | 'ADMIN_TO_DEV';

export interface SupportTicket {
  id: string;
  flow: TicketFlow; // Define quem atende quem
  userId: string; // Quem abriu
  userName: string; 
  clientId?: string; // Contexto da organização (se aplicável)
  subject: string;
  description: string; // O problema relatado
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  resolutionNote?: string; // Texto preenchido por quem resolveu
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceEvent {
  id: string;
  title: string;
  scheduledDate: string;
  durationMinutes: number;
  description: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  createdBy: string;
}

// NEW: Global System Status for Maintenance Mode
export interface SystemStatus {
    mode: 'ONLINE' | 'MAINTENANCE' | 'SCHEDULED';
    message?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    updatedBy?: string;
}

// NEW: Network Security Types
export interface NetworkPort {
  port: number;
  service: string; // e.g., SSH, HTTP, POSTGRES
  protocol: 'TCP' | 'UDP';
  status: 'OPEN' | 'CLOSED' | 'FILTERED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  exposedTo: 'PUBLIC' | 'INTERNAL' | 'VPN';
}

export interface FirewallRule {
  id: string;
  name: string;
  type: 'INBOUND' | 'OUTBOUND';
  protocol: 'TCP' | 'UDP' | 'ANY';
  port: string; // "80", "443", "ANY"
  source: string; // IP or CIDR
  action: 'ALLOW' | 'DENY';
  active: boolean;
  priority: number;
}
