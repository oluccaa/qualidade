
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
  lastLogin?: string;
}

export enum FileType {
  FOLDER = 'FOLDER',
  PDF = 'PDF',
  IMAGE = 'IMAGE',
  OTHER = 'OTHER'
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
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'DOWNLOAD' | 'PREVIEW' | 'UPLOAD' | 'DELETE' | 'CREATE_USER' | 'UPDATE_SYSTEM';
  target: string; // File name or Folder name
  timestamp: string;
}
