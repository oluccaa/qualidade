
import { FileNode, FileType, User, UserRole, AuditLog, ClientOrganization, AppNotification, SupportTicket, MaintenanceEvent, NetworkPort, FirewallRule } from '../types.ts';

// ID Constante para o Repositório Mestre
export const MASTER_ORG_ID = 'org-master-library';

// Mock Clients (Organizations)
export const MOCK_CLIENTS: ClientOrganization[] = [
  { id: 'c1', name: 'Empresa X Indústria Metalúrgica', cnpj: '12.345.678/0001-90', status: 'ACTIVE', contractDate: '2022-01-15' },
  { id: 'c2', name: 'Construtora Y Empreendimentos', cnpj: '98.765.432/0001-10', status: 'ACTIVE', contractDate: '2023-05-20' },
  { id: 'c3', name: 'AutoPeças Z', cnpj: '45.123.789/0001-55', status: 'INACTIVE', contractDate: '2021-11-30' },
];

// Mock Users
export const MOCK_USERS: User[] = [
  // Internal Team
  { id: 'u1', name: 'Admin User', email: 'admin@acosvital.com', role: UserRole.ADMIN, status: 'ACTIVE', lastLogin: '2023-10-26 10:00', department: 'TI / Segurança' },
  { id: 'u2', name: 'João (Qualidade)', email: 'joao@acosvital.com', role: UserRole.QUALITY, status: 'ACTIVE', lastLogin: '2023-10-26 09:30', department: 'Controle de Qualidade' },
  
  // Client 1 Users (Empresa X has 2 users)
  { id: 'u3', name: 'Ricardo (Compras)', email: 'compras@empresax.com', role: UserRole.CLIENT, clientId: 'c1', status: 'ACTIVE', lastLogin: '2023-10-25 14:20', department: 'Suprimentos' },
  { id: 'u6', name: 'Pedro (Engenharia)', email: 'eng@empresax.com', role: UserRole.CLIENT, clientId: 'c1', status: 'ACTIVE', lastLogin: '2023-10-26 08:15', department: 'Engenharia' }, // 2nd User for Company X
  
  // Client 2 User
  { id: 'u4', name: 'Eng. Civil Y', email: 'eng@construtoray.com', role: UserRole.CLIENT, clientId: 'c2', status: 'ACTIVE', lastLogin: '2023-10-24 16:45', department: 'Obras' },
  
  // Client 3 User
  { id: 'u5', name: 'Financeiro Z', email: 'fin@autopecasz.com', role: UserRole.CLIENT, clientId: 'c3', status: 'BLOCKED', lastLogin: '2023-09-10 11:00', department: 'Financeiro' },
];

// Mock File System
// Structure: Root -> Client Folder -> Year -> Category
export const MOCK_FILES: FileNode[] = [
  // --- MASTER LIBRARY (Repositório Central) ---
  { id: 'master-root', parentId: null, name: 'Repositório Central', type: FileType.FOLDER, updatedAt: '2023-01-01', ownerId: MASTER_ORG_ID },
  { 
    id: 'm-doc1', 
    parentId: 'master-root', 
    name: 'Certificado_Padrao_ISO9001.pdf', 
    type: FileType.PDF, 
    size: '1.2 MB', 
    updatedAt: '2023-10-01', 
    ownerId: MASTER_ORG_ID, 
    tags: ['Modelo', 'ISO'],
    metadata: { batchNumber: 'MODELO-001', productName: 'Certificado Genérico', status: 'APPROVED' }
  },
  { 
    id: 'm-doc2', 
    parentId: 'master-root', 
    name: 'Especificacao_Tecnica_SAE1045.pdf', 
    type: FileType.PDF, 
    size: '2.5 MB', 
    updatedAt: '2023-10-05', 
    ownerId: MASTER_ORG_ID, 
    tags: ['Técnico', 'SAE 1045'],
    metadata: { batchNumber: 'REF-1045', productName: 'Aço SAE 1045', status: 'APPROVED' }
  },
  { 
    id: 'm-doc3', 
    parentId: 'master-root', 
    name: 'Procedimento_Soldagem_WPS.pdf', 
    type: FileType.PDF, 
    size: '4.0 MB', 
    updatedAt: '2023-10-10', 
    ownerId: MASTER_ORG_ID, 
    tags: ['Solda', 'Procedimento'],
    metadata: { batchNumber: 'WPS-General', productName: 'Procedimento Solda', status: 'APPROVED' }
  },

  // Client 1 Structure (Empresa X)
  { id: 'f1', parentId: null, name: 'Empresa X', type: FileType.FOLDER, updatedAt: '2023-10-01', ownerId: 'c1' },
  { id: 'f1-1', parentId: 'f1', name: 'Certificados de Qualidade', type: FileType.FOLDER, updatedAt: '2023-10-02', ownerId: 'c1' },
  
  { 
    id: 'doc1', 
    parentId: 'f1-1', 
    name: 'CQ_Lote_998_SAE1045.pdf', 
    type: FileType.PDF, 
    size: '2.4 MB', 
    updatedAt: '2023-10-26', 
    ownerId: 'c1', 
    tags: ['Lote 998', 'SAE 1045'],
    metadata: { batchNumber: 'L-998', productName: 'Barra Redonda SAE 1045', status: 'APPROVED', invoiceNumber: 'NF-102030' }
  },
  { 
    id: 'doc2', 
    parentId: 'f1-1', 
    name: 'Analise_Quimica_1020.pdf', 
    type: FileType.PDF, 
    size: '1.1 MB', 
    updatedAt: '2023-10-25', 
    ownerId: 'c1', 
    tags: ['SAE 1020', 'Químico'],
    metadata: { batchNumber: 'CORRIDA-554', productName: 'Chapa SAE 1020', status: 'APPROVED', invoiceNumber: 'NF-102031' }
  },
  { 
    id: 'doc3', 
    parentId: 'f1-1', 
    name: 'Laudo_Impacto_Charpy.pdf', 
    type: FileType.PDF, 
    size: '3.5 MB', 
    updatedAt: '2023-10-24', 
    ownerId: 'c1', 
    tags: ['Charpy', 'Especial'],
    metadata: { batchNumber: 'L-998', productName: 'Barra Redonda SAE 1045', status: 'PENDING' }
  },

  // Client 2 Structure (Construtora Y)
  { id: 'f2', parentId: null, name: 'Construtora Y', type: FileType.FOLDER, updatedAt: '2023-09-15', ownerId: 'c2' },
  { id: 'f2-1', parentId: 'f2', name: 'Certificados', type: FileType.FOLDER, updatedAt: '2023-09-20', ownerId: 'c2' },
  { 
    id: 'doc4', 
    parentId: 'f2-1', 
    name: 'Vigas_H_Lote_55.pdf', 
    type: FileType.PDF, 
    size: '5.0 MB', 
    updatedAt: '2023-09-22', 
    ownerId: 'c2', 
    tags: ['Vigas', 'Estrutural'],
    metadata: { batchNumber: 'VIGA-55', productName: 'Viga H W200', status: 'APPROVED', invoiceNumber: 'NF-500' }
  },
];

// MOCK SECURITY LOGS (Complex & Rich)
export const MOCK_LOGS: AuditLog[] = [
  { 
    id: 'sec-001', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
    userId: 'u3', 
    userName: 'Ricardo (Empresa X)', 
    userRole: 'CLIENT',
    action: 'LOGIN_ATTEMPT', 
    category: 'AUTH',
    target: 'Portal Auth Service', 
    severity: 'INFO', 
    status: 'SUCCESS',
    ip: '201.12.34.55', 
    location: 'São Paulo, BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
    device: 'Desktop (Windows)',
    requestId: 'req-abc-123',
    metadata: { method: 'POST', path: '/api/auth/login', latency: '120ms' }
  },
  // ... (Logs mantidos, abreviados para brevidade na resposta)
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    userId: 'u3', // Client User
    title: 'Certificado Aprovado',
    message: 'O certificado do Lote 998 (SAE 1045) foi aprovado e está disponível para download.',
    type: 'SUCCESS',
    isRead: false,
    timestamp: 'Há 10 minutos',
    link: '/dashboard?view=files&search=Lote 998'
  },
  // ...
];

export const MOCK_TICKETS: SupportTicket[] = [
  { 
    id: 't1', 
    flow: 'CLIENT_TO_QUALITY',
    userId: 'u3', 
    userName: 'Ricardo (Empresa X)', 
    clientId: 'c1',
    subject: 'Erro ao baixar laudo 1045', 
    description: 'Recebo erro 403 ao tentar baixar o certificado do lote L-998.', 
    priority: 'HIGH', 
    status: 'OPEN', 
    createdAt: '2023-10-26 09:00'
  },
  { 
    id: 't2', 
    flow: 'CLIENT_TO_QUALITY',
    userId: 'u4', 
    userName: 'Eng. Civil Y',
    clientId: 'c2',
    subject: 'Dúvida sobre Especificação', 
    description: 'Preciso confirmar se o lote VIGA-55 atende a norma ASTM A572.', 
    priority: 'MEDIUM', 
    status: 'IN_PROGRESS', 
    createdAt: '2023-10-25 15:30',
    resolutionNote: ''
  },
  {
    id: 't3',
    flow: 'QUALITY_TO_ADMIN',
    userId: 'u2',
    userName: 'João (Qualidade)',
    subject: 'Sistema Lento na Geração de ZIP',
    description: 'A função de download em massa está demorando mais de 2 minutos para 10 arquivos.',
    priority: 'MEDIUM',
    status: 'RESOLVED',
    createdAt: '2023-10-20 10:00',
    resolutionNote: 'Otimização de cache aplicada no servidor. Tempo reduzido para 15s.'
  }
];

export const MOCK_MAINTENANCE: MaintenanceEvent[] = [
  { id: 'm1', title: 'Atualização de Segurança - Banco de Dados', scheduledDate: '2023-10-29 02:00', durationMinutes: 120, description: 'Aplicação de patches de segurança no cluster PostgreSQL.', status: 'SCHEDULED', createdBy: 'Admin' },
];

export const MOCK_PORTS: NetworkPort[] = [
  { port: 80, service: 'HTTP (Frontend)', protocol: 'TCP', status: 'OPEN', riskLevel: 'MEDIUM', exposedTo: 'PUBLIC' },
];

export const MOCK_FIREWALL_RULES: FirewallRule[] = [
  { id: 'fw-1', name: 'Allow HTTPS Global', type: 'INBOUND', protocol: 'TCP', port: '443', source: '0.0.0.0/0', action: 'ALLOW', active: true, priority: 1 },
];
