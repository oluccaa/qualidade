
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
  { 
    id: 'sec-002', 
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), 
    userId: 'u5', 
    userName: 'Financeiro Z', 
    userRole: 'CLIENT',
    action: 'FILE_DOWNLOAD', 
    category: 'DATA',
    target: 'Vigas_H_Lote_55.pdf', 
    severity: 'WARNING', 
    status: 'FAILURE',
    ip: '189.45.12.99', 
    location: 'Rio de Janeiro, BR',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    device: 'Desktop (MacOS)',
    requestId: 'req-xyz-789',
    metadata: { error: '403 Forbidden', reason: 'Insufficient Permissions', documentId: 'doc4', ownerOrg: 'c2' }
  },
  { 
    id: 'sec-003', 
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), 
    userId: 'u2', 
    userName: 'João (Qualidade)', 
    userRole: 'QUALITY',
    action: 'STATUS_UPDATE', 
    category: 'SYSTEM',
    target: 'Lote L-998', 
    severity: 'INFO', 
    status: 'SUCCESS',
    ip: '10.0.0.5', 
    location: 'Internal Network',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    device: 'Desktop (Linux)',
    requestId: 'req-int-555',
    metadata: { previousStatus: 'PENDING', newStatus: 'APPROVED', changedFields: ['status', 'approverId'] }
  },
  { 
    id: 'sec-004', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), 
    userId: 'unknown', 
    userName: 'Unknown', 
    userRole: 'ANONYMOUS',
    action: 'SQL_INJECTION_ATTEMPT', 
    category: 'SECURITY',
    target: '/api/v1/users', 
    severity: 'CRITICAL', 
    status: 'FAILURE',
    ip: '45.22.11.99', 
    location: 'Moscow, RU',
    userAgent: 'sqlmap/1.5.2#stable',
    device: 'Bot / Script',
    requestId: 'req-sec-999',
    metadata: { payload: "' OR 1=1 --", blockedBy: 'WAF', ruleId: '942100' }
  },
  { 
    id: 'sec-005', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    userId: 'u1', 
    userName: 'Admin User', 
    userRole: 'ADMIN',
    action: 'USER_ROLE_CHANGE', 
    category: 'SECURITY',
    target: 'User: Financeiro Z', 
    severity: 'WARNING', 
    status: 'SUCCESS',
    ip: '10.0.0.2', 
    location: 'Internal Network',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    device: 'Desktop (Windows)',
    requestId: 'req-adm-001',
    metadata: { previousRole: 'CLIENT', newStatus: 'BLOCKED', reason: 'Suspicious activity detected' }
  },
  { 
    id: 'sec-006', 
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), 
    userId: 'u3', 
    userName: 'Ricardo (Empresa X)', 
    userRole: 'CLIENT',
    action: 'BULK_DOWNLOAD', 
    category: 'DATA',
    target: 'Certificados 2023', 
    severity: 'INFO', 
    status: 'SUCCESS',
    ip: '201.12.34.55', 
    location: 'São Paulo, BR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0)',
    device: 'Desktop (Windows)',
    requestId: 'req-bulk-444',
    metadata: { fileCount: 15, totalSize: '45MB', format: 'ZIP' }
  },
  { 
    id: 'sec-007', 
    timestamp: new Date(Date.now() - 1000 * 30).toISOString(), 
    userId: 'system', 
    userName: 'SYSTEM_CRON', 
    userRole: 'SYSTEM',
    action: 'DB_BACKUP', 
    category: 'SYSTEM',
    target: 'Primary Database', 
    severity: 'INFO', 
    status: 'SUCCESS',
    ip: 'localhost', 
    location: 'Server Farm',
    userAgent: 'CronJob/1.0',
    device: 'Server',
    requestId: 'job-bkp-2023',
    metadata: { size: '2.4GB', duration: '45s', integrityCheck: 'PASSED' }
  },
  { 
    id: 'sec-008', 
    timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(), 
    userId: 'u4', 
    userName: 'Eng. Civil Y', 
    userRole: 'CLIENT',
    action: 'INVALID_TOKEN', 
    category: 'AUTH',
    target: '/api/secure/docs', 
    severity: 'ERROR', 
    status: 'FAILURE',
    ip: '177.55.44.33', 
    location: 'Belo Horizonte, BR',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    device: 'Mobile (iOS)',
    requestId: 'req-inv-tk',
    metadata: { error: 'Token Expired', tokenIAT: 1698000000 }
  }
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
  {
    id: 'n2',
    userId: 'u3',
    title: 'Manutenção Programada',
    message: 'O sistema passará por manutenção neste domingo das 02h às 04h.',
    type: 'INFO',
    isRead: false,
    timestamp: 'Há 2 horas'
  },
  {
    id: 'n3',
    userId: 'u2', // Quality User
    title: 'Novo Upload Pendente',
    message: 'Um novo documento requer sua aprovação técnica.',
    type: 'WARNING',
    isRead: false,
    timestamp: 'Há 5 minutos',
    link: '/quality'
  },
  {
    id: 'n4',
    userId: 'ALL',
    title: 'Política de Privacidade',
    message: 'Nossos termos de uso foram atualizados conforme a LGPD.',
    type: 'INFO',
    isRead: true,
    timestamp: 'Ontem'
  }
];

export const MOCK_TICKETS: SupportTicket[] = [
  { id: 't1', userId: 'u3', userName: 'Ricardo (Empresa X)', subject: 'Erro ao baixar laudo 1045', description: 'Recebo erro 403 ao tentar baixar o certificado do lote L-998.', priority: 'HIGH', status: 'OPEN', createdAt: '2023-10-26 09:00' },
  { id: 't2', userId: 'u4', userName: 'Eng. Civil Y', subject: 'Dúvida sobre Especificação', description: 'Preciso confirmar se o lote VIGA-55 atende a norma ASTM A572.', priority: 'MEDIUM', status: 'IN_PROGRESS', createdAt: '2023-10-25 15:30' },
  { id: 't3', userId: 'u2', userName: 'João (Interno)', subject: 'Lentidão no upload', description: 'O sistema está demorando mais de 2 minutos para processar PDFs grandes.', priority: 'LOW', status: 'RESOLVED', createdAt: '2023-10-24 10:00' },
];

export const MOCK_MAINTENANCE: MaintenanceEvent[] = [
  { id: 'm1', title: 'Atualização de Segurança - Banco de Dados', scheduledDate: '2023-10-29 02:00', durationMinutes: 120, description: 'Aplicação de patches de segurança no cluster PostgreSQL.', status: 'SCHEDULED', createdBy: 'Admin' },
  { id: 'm2', title: 'Deploy Nova Versão v2.5', scheduledDate: '2023-10-15 22:00', durationMinutes: 30, description: 'Lançamento do módulo de Ticketing.', status: 'COMPLETED', createdBy: 'Admin' },
];

// NEW: MOCK PORTS & FIREWALL RULES
export const MOCK_PORTS: NetworkPort[] = [
  { port: 80, service: 'HTTP (Frontend)', protocol: 'TCP', status: 'OPEN', riskLevel: 'MEDIUM', exposedTo: 'PUBLIC' },
  { port: 443, service: 'HTTPS (SSL/TLS)', protocol: 'TCP', status: 'OPEN', riskLevel: 'LOW', exposedTo: 'PUBLIC' },
  { port: 22, service: 'SSH (Remote Access)', protocol: 'TCP', status: 'OPEN', riskLevel: 'HIGH', exposedTo: 'PUBLIC' },
  { port: 5432, service: 'PostgreSQL (DB)', protocol: 'TCP', status: 'OPEN', riskLevel: 'CRITICAL', exposedTo: 'PUBLIC' },
  { port: 3000, service: 'API Backend', protocol: 'TCP', status: 'FILTERED', riskLevel: 'LOW', exposedTo: 'INTERNAL' },
  { port: 6379, service: 'Redis (Cache)', protocol: 'TCP', status: 'CLOSED', riskLevel: 'LOW', exposedTo: 'INTERNAL' }
];

export const MOCK_FIREWALL_RULES: FirewallRule[] = [
  { id: 'fw-1', name: 'Allow HTTPS Global', type: 'INBOUND', protocol: 'TCP', port: '443', source: '0.0.0.0/0', action: 'ALLOW', active: true, priority: 1 },
  { id: 'fw-2', name: 'Allow HTTP (Redirect)', type: 'INBOUND', protocol: 'TCP', port: '80', source: '0.0.0.0/0', action: 'ALLOW', active: true, priority: 2 },
  { id: 'fw-3', name: 'Block Malicious IPs', type: 'INBOUND', protocol: 'ANY', port: 'ANY', source: '45.22.11.99', action: 'DENY', active: true, priority: 0 },
  { id: 'fw-4', name: 'Allow SSH (Office VPN)', type: 'INBOUND', protocol: 'TCP', port: '22', source: '10.0.0.0/24', action: 'ALLOW', active: false, priority: 5 },
];
