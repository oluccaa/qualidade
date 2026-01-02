
import { FileNode, FileType, User, UserRole, AuditLog, ClientOrganization } from '../types.ts';

// Mock Clients (Organizations)
export const MOCK_CLIENTS: ClientOrganization[] = [
  { id: 'c1', name: 'Empresa X Indústria Metalúrgica', cnpj: '12.345.678/0001-90', status: 'ACTIVE', contractDate: '2022-01-15' },
  { id: 'c2', name: 'Construtora Y Empreendimentos', cnpj: '98.765.432/0001-10', status: 'ACTIVE', contractDate: '2023-05-20' },
  { id: 'c3', name: 'AutoPeças Z', cnpj: '45.123.789/0001-55', status: 'INACTIVE', contractDate: '2021-11-30' },
];

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@acosvital.com', role: UserRole.ADMIN, status: 'ACTIVE', lastLogin: '2023-10-26 10:00' },
  { id: 'u2', name: 'João (Qualidade)', email: 'joao@acosvital.com', role: UserRole.QUALITY, status: 'ACTIVE', lastLogin: '2023-10-26 09:30' },
  { id: 'u3', name: 'Comprador Empresa X', email: 'compras@empresax.com', role: UserRole.CLIENT, clientId: 'c1', status: 'ACTIVE', lastLogin: '2023-10-25 14:20' },
  { id: 'u4', name: 'Eng. Civil Y', email: 'eng@construtoray.com', role: UserRole.CLIENT, clientId: 'c2', status: 'ACTIVE', lastLogin: '2023-10-24 16:45' },
  { id: 'u5', name: 'Financeiro Z', email: 'fin@autopecasz.com', role: UserRole.CLIENT, clientId: 'c3', status: 'BLOCKED', lastLogin: '2023-09-10 11:00' },
];

// Mock File System
// Structure: Root -> Client Folder -> Year -> Category
export const MOCK_FILES: FileNode[] = [
  // Client 1 Structure (Empresa X)
  { id: 'f1', parentId: null, name: 'Empresa X', type: FileType.FOLDER, updatedAt: '2023-10-01', ownerId: 'c1' },
  { id: 'f1-1', parentId: 'f1', name: 'Certificados de Qualidade', type: FileType.FOLDER, updatedAt: '2023-10-02', ownerId: 'c1' },
  { id: 'doc1', parentId: 'f1-1', name: 'Certificado_Lote_998.pdf', type: FileType.PDF, size: '2.4 MB', updatedAt: '2023-10-10', ownerId: 'c1', tags: ['Lote 998', 'SAE 1045'] },
  { id: 'doc2', parentId: 'f1-1', name: 'Analise_Quimica_Aco_1020.pdf', type: FileType.PDF, size: '1.1 MB', updatedAt: '2023-10-12', ownerId: 'c1', tags: ['SAE 1020', 'Químico'] },

  // Client 2 Structure (Construtora Y)
  { id: 'f2', parentId: null, name: 'Construtora Y', type: FileType.FOLDER, updatedAt: '2023-09-15', ownerId: 'c2' },
  { id: 'f2-1', parentId: 'f2', name: 'Certificados', type: FileType.FOLDER, updatedAt: '2023-09-20', ownerId: 'c2' },
  { id: 'doc3', parentId: 'f2-1', name: 'Vigas_H_Lote_55.pdf', type: FileType.PDF, size: '5.0 MB', updatedAt: '2023-09-22', ownerId: 'c2', tags: ['Vigas', 'Estrutural'] },
];

export const MOCK_LOGS: AuditLog[] = [
  { id: 'l1', userId: 'u3', userName: 'Empresa X', action: 'LOGIN', target: 'System', timestamp: '2023-10-25 08:30:00' },
  { id: 'l2', userId: 'u3', userName: 'Empresa X', action: 'DOWNLOAD', target: 'Certificado_Lote_998.pdf', timestamp: '2023-10-25 08:35:12' },
  { id: 'l3', userId: 'u2', userName: 'João (Qualidade)', action: 'UPLOAD', target: 'Laudo_Tecnico_Final.pdf', timestamp: '2023-10-25 09:10:00' },
];
