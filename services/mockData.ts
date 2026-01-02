import { FileNode, FileType, User, UserRole, AuditLog } from '../types.ts';

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@acosvital.com', role: UserRole.ADMIN },
  { id: 'u2', name: 'João (Qualidade)', email: 'joao@acosvital.com', role: UserRole.QUALITY },
  { id: 'u3', name: 'Empresa X (Cliente)', email: 'compras@empresax.com', role: UserRole.CLIENT, clientId: 'c1' },
  { id: 'u4', name: 'Construtora Y (Cliente)', email: 'eng@construtoray.com', role: UserRole.CLIENT, clientId: 'c2' },
];

// Mock File System
// Structure: Root -> Client Folder -> Year -> Category
export const MOCK_FILES: FileNode[] = [
  // Client 1 Structure (Empresa X)
  { id: 'f1', parentId: null, name: 'Empresa X', type: FileType.FOLDER, updatedAt: '2023-10-01', ownerId: 'c1' },
  { id: 'f1-1', parentId: 'f1', name: 'Certificados de Qualidade', type: FileType.FOLDER, updatedAt: '2023-10-02', ownerId: 'c1' },
  // Folder for Notas Fiscais removed
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