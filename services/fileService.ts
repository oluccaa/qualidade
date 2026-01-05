
import { FileNode, User, UserRole, AuditLog, FileType, LibraryFilters, FileMetadata } from '../types.ts';
import { MOCK_FILES, MOCK_LOGS, MASTER_ORG_ID, MOCK_CLIENTS } from './mockData.ts';
import * as notificationService from './notificationService.ts';

// Simulate a database state
let currentFiles = [...MOCK_FILES];
let currentLogs = [...MOCK_LOGS];

// In-memory store for favorites (User ID -> Set of File IDs)
const favoritesStore: Record<string, Set<string>> = {};

// --- FILE OPERATIONS ---

// Helper to check if file is favorite
const isFileFavorite = (userId: string, fileId: string): boolean => {
    return favoritesStore[userId]?.has(fileId) || false;
};

export const toggleFavorite = async (user: User, fileId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 200)); // optimistic UI latency
    
    if (!favoritesStore[user.id]) {
        favoritesStore[user.id] = new Set();
    }

    const userFavs = favoritesStore[user.id];
    if (userFavs.has(fileId)) {
        userFavs.delete(fileId);
        return false; // Removed
    } else {
        userFavs.add(fileId);
        return true; // Added
    }
};

export const getFavorites = async (user: User): Promise<FileNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const userFavs = favoritesStore[user.id] || new Set();
    
    // Filter files that are in the user's favorite list AND they have access to
    const files = currentFiles.filter(f => userFavs.has(f.id));
    
    // Apply security check (just in case permissions changed)
    const accessibleFiles = files.filter(file => {
         if (user.role === UserRole.CLIENT) {
             // Client sees only their files AND approved files (or folders)
             const isOwner = file.ownerId === user.clientId;
             const isApproved = file.type === FileType.FOLDER || file.metadata?.status === 'APPROVED';
             return isOwner && isApproved;
         }
         return true;
    });

    return accessibleFiles.map(f => ({ ...f, isFavorite: true }));
};

export const getFiles = async (user: User, folderId: string | null): Promise<FileNode[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency

  const files = currentFiles.filter(file => {
    // 1. Match Parent Folder
    if (file.parentId !== folderId) return false;

    // 2. Security / Data Isolation Check
    if (user.role === UserRole.CLIENT) {
      // Client can ONLY see files owned by their clientId
      const isOwner = file.ownerId === user.clientId;
      // LOGIC UPDATE: Clients only see APPROVED files (Folders are always visible)
      const isApproved = file.type === FileType.FOLDER || file.metadata?.status === 'APPROVED';
      return isOwner && isApproved;
    }

    // Admin and Quality can see everything (Including Master Org)
    return true;
  });

  // Map favorite status
  return files.map(f => ({ ...f, isFavorite: isFileFavorite(user.id, f.id) }));
};

export const getFilesByOwner = async (ownerId: string): Promise<FileNode[]> => {
    // Helper to get root folder for a specific client to start navigation
    return currentFiles.filter(f => f.ownerId === ownerId);
};

// NEW: Get all Master Library Files (Flat list for the modal)
export const getMasterLibraryFiles = async (): Promise<FileNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    // Return all files (not folders) belonging to Master Org
    return currentFiles.filter(f => f.ownerId === MASTER_ORG_ID && f.type !== FileType.FOLDER);
};

// NEW: Import/Copy files from Master to Client
export const importFilesFromMaster = async (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulating "Copying" process

    const masterFiles = currentFiles.filter(f => fileIds.includes(f.id));
    
    const newFiles: FileNode[] = masterFiles.map(mf => ({
        ...mf,
        id: `copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // New ID
        parentId: targetFolderId, // Move to client folder
        ownerId: targetOwnerId, // Assign ownership to client
        updatedAt: new Date().toISOString().split('T')[0], // Fresh date
        name: mf.name, // Keep original name (or could append "Copy")
        metadata: {
            ...mf.metadata,
            status: 'APPROVED' // LOGIC UPDATE: Imported files are automatically APPROVED for the client
        }
    }));

    currentFiles.push(...newFiles);
    await logAction(user, 'UPLOAD', `Importou ${newFiles.length} arquivos do Repositório Mestre`);
    
    // NOTIFICATION: Find users of this client Org and notify them
    // In a real app we'd fetch users by OrgID. Here we cheat and use MOCK_USERS implicitly via notificationService filtering or logic
    // For now, we will add a notification for the 'targetOwnerId' context if possible, but our NotifService uses UserId.
    // We'll find users belonging to targetOwnerId.
    // (Since we don't have access to MOCK_USERS array here easily without import cycle, we skip broad notification or implement later)
};

// Get recent files (flat list) for dashboard or history view
export const getRecentFiles = async (user: User, limit: number = 20): Promise<FileNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let files = currentFiles.filter(f => f.type !== FileType.FOLDER);

    if (user.role === UserRole.CLIENT) {
        files = files.filter(f => f.ownerId === user.clientId && f.metadata?.status === 'APPROVED');
    }

    // Sort by Date Descending (Mock logic: using updatedAt as access time for demo)
    const sorted = files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const sliced = sorted.slice(0, limit);

    return sliced.map(f => ({ ...f, isFavorite: isFileFavorite(user.id, f.id) }));
};

// Advanced Library Search (Flat View with Filters)
export const getLibraryFiles = async (user: User, filters: LibraryFilters): Promise<FileNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate complex query latency

    // 1. Start with all non-folder files
    let files = currentFiles.filter(f => f.type !== FileType.FOLDER);

    // 2. Security Check
    if (user.role === UserRole.CLIENT) {
        files = files.filter(f => f.ownerId === user.clientId && f.metadata?.status === 'APPROVED');
    }

    // 3. Apply Filters
    const filtered = files.filter(file => {
        // Date Range
        if (filters.startDate && file.updatedAt < filters.startDate) return false;
        if (filters.endDate && file.updatedAt > filters.endDate) return false;

        // Status
        if (filters.status !== 'ALL') {
            if (file.metadata?.status !== filters.status) return false;
        }

        // Search Term (Matches Name, Batch, Product, Invoice)
        if (filters.search) {
            const term = filters.search.toLowerCase();
            const matchesName = file.name.toLowerCase().includes(term);
            const matchesTag = file.tags?.some(tag => tag.toLowerCase().includes(term));
            const matchesBatch = file.metadata?.batchNumber?.toLowerCase().includes(term);
            const matchesProduct = file.metadata?.productName?.toLowerCase().includes(term);
            const matchesInvoice = file.metadata?.invoiceNumber?.toLowerCase().includes(term);

            if (!matchesName && !matchesTag && !matchesBatch && !matchesInvoice) return false;
        }

        return true;
    });

    return filtered.map(f => ({ ...f, isFavorite: isFileFavorite(user.id, f.id) }));
};

// --- Dashboard Statistics ---
export const getDashboardStats = async (user: User) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let relevantFiles = currentFiles.filter(f => f.type !== FileType.FOLDER);

    if (user.role === UserRole.CLIENT) {
        // Client View: Only their files
        // LOGIC UPDATE: We look at ALL files belonging to them to calculate underlying stats, 
        // but since the rule is "Upload = Approved", we mock 100% compliance.
        const allClientFiles = relevantFiles.filter(f => f.ownerId === user.clientId);
        
        // However, technically, only APPROVED files are visible.
        const visibleFiles = allClientFiles.filter(f => f.metadata?.status === 'APPROVED');
        
        const totalDocs = visibleFiles.length;
        
        // Compliance is visually 100% because if they see it, it's valid.
        const compliance = 100;

        return {
            mainLabel: 'Conformidade Documental',
            subLabel: 'Lotes Disponíveis',
            mainValue: compliance,
            subValue: totalDocs,
            pendingValue: 0, // Clients have no visibility of pending items
            status: 'REGULAR'
        };
    } else {
        // Quality/Admin View: System Wide (excluding Master)
        relevantFiles = relevantFiles.filter(f => f.ownerId !== MASTER_ORG_ID);
        
        const totalDocs = relevantFiles.length;
        const totalPending = relevantFiles.filter(f => f.metadata?.status === 'PENDING').length;
        const activeClients = MOCK_CLIENTS.filter(c => c.status === 'ACTIVE').length;

        return {
            mainLabel: 'Eficiência Operacional', // Metric name
            subLabel: 'Total de Arquivos',
            mainValue: 98, // Mock efficiency score
            subValue: totalDocs, // Total files in system
            pendingValue: totalPending, // Total pending approvals
            activeClients: activeClients,
            status: 'REGULAR'
        };
    }
};

// --- Mutation Methods (Quality Management) ---

export const createFolder = async (user: User, parentId: string | null, name: string, ownerId?: string): Promise<FileNode | null> => {
  if (user.role === UserRole.CLIENT) return null; // Clients cannot create

  const newFolder: FileNode = {
    id: `new-${Date.now()}`,
    parentId,
    name,
    type: 'FOLDER' as any,
    updatedAt: new Date().toISOString().split('T')[0],
    ownerId: ownerId // Assign to specific client context
  };

  currentFiles.push(newFolder);
  await logAction(user, 'UPDATE_SYSTEM', `Criou pasta: ${name}`);
  return newFolder;
};

export const uploadFile = async (user: User, fileData: Partial<FileNode>, ownerId: string): Promise<FileNode> => {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating upload

    const newFile: FileNode = {
        id: `file-${Date.now()}`,
        parentId: fileData.parentId || null,
        name: fileData.name || 'Sem nome',
        type: FileType.PDF, // Defaulting to PDF for demo
        size: '1.5 MB',
        updatedAt: new Date().toISOString().split('T')[0],
        ownerId: ownerId,
        metadata: fileData.metadata,
        tags: fileData.tags || []
    };

    currentFiles.push(newFile);
    await logAction(user, 'UPLOAD', newFile.name);

    // NOTIFICATION: If Quality uploaded for a specific client (and approved), notify that client's users
    if (user.role === UserRole.QUALITY && ownerId !== MASTER_ORG_ID && newFile.metadata?.status === 'APPROVED') {
        // Find users for this client (Mock logic: Assuming we know user IDs or notify all in that org)
        // Hardcoded example: If uploading for Empresa X (c1), notify u3 and u6
        if (ownerId === 'c1') {
             await notificationService.addNotification('u3', 'Novo Documento Disponível', `Certificado ${newFile.name} foi adicionado.`, 'SUCCESS', '/dashboard?view=recent');
             await notificationService.addNotification('u6', 'Novo Documento Disponível', `Certificado ${newFile.name} foi adicionado.`, 'SUCCESS', '/dashboard?view=recent');
        } else if (ownerId === 'c2') {
             await notificationService.addNotification('u4', 'Novo Documento Disponível', `Certificado ${newFile.name} foi adicionado.`, 'SUCCESS', '/dashboard?view=recent');
        }
    }

    return newFile;
};

// Generic update function for metadata and renaming
export const updateFile = async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const index = currentFiles.findIndex(f => f.id === fileId);
    if (index !== -1) {
        currentFiles[index] = {
            ...currentFiles[index],
            ...updates,
            metadata: {
                ...currentFiles[index].metadata,
                ...updates.metadata
            }
        };
        await logAction(user, 'UPDATE_SYSTEM', `Atualizou arquivo: ${currentFiles[index].name}`);
    }
};

export const deleteFile = async (user: User, fileId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // RECURSIVE DELETE LOGIC
    const getAllDescendants = (parentId: string): string[] => {
        const children = currentFiles.filter(f => f.parentId === parentId);
        let ids = children.map(c => c.id);
        children.forEach(c => {
            if (c.type === FileType.FOLDER) {
                ids = [...ids, ...getAllDescendants(c.id)];
            }
        });
        return ids;
    };

    const targetFile = currentFiles.find(f => f.id === fileId);
    if (targetFile) {
        const idsToDelete = [fileId, ...getAllDescendants(fileId)];
        currentFiles = currentFiles.filter(f => !idsToDelete.includes(f.id));
        await logAction(user, 'DELETE', targetFile.name);
    }
};

export const searchFiles = async (user: User, query: string): Promise<FileNode[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const lowerQuery = query.toLowerCase();

  const results = currentFiles.filter(file => {
    const matchesName = file.name.toLowerCase().includes(lowerQuery);
    const matchesTag = file.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    const matchesBatch = file.metadata?.batchNumber?.toLowerCase().includes(lowerQuery);
    const matchesInvoice = file.metadata?.invoiceNumber?.toLowerCase().includes(lowerQuery);
    
    if (!matchesName && !matchesTag && !matchesBatch && !matchesInvoice) return false;

    // Security Check
    if (user.role === UserRole.CLIENT) {
      const isOwner = file.ownerId === user.clientId;
      // LOGIC UPDATE: Clients only find APPROVED files
      const isApproved = file.type === FileType.FOLDER || file.metadata?.status === 'APPROVED';
      return isOwner && isApproved;
    }
    return true;
  });

  return results.map(f => ({ ...f, isFavorite: isFileFavorite(user.id, f.id) }));
};

export const getBreadcrumbs = (folderId: string | null): { id: string, name: string }[] => {
  if (!folderId) return [{ id: 'root', name: 'Início' }];

  const crumbs: { id: string, name: string }[] = [];
  let currentId: string | null = folderId;

  while (currentId) {
    const file = currentFiles.find(f => f.id === currentId);
    if (file) {
      crumbs.unshift({ id: file.id, name: file.name });
      currentId = file.parentId;
    } else {
      currentId = null;
    }
  }
  
  crumbs.unshift({ id: 'root', name: 'Início' });
  return crumbs;
};

// --- Security & Audit Logs ---

export const logAction = async (user: User, action: string, target: string, severity: 'INFO'|'WARNING'|'ERROR'|'CRITICAL' = 'INFO') => {
    // Simplified logging without external calls to prevent rate limits/errors
    const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        action,
        category: 'SYSTEM',
        target,
        severity,
        status: 'SUCCESS',
        ip: '127.0.0.1 (Internal)', 
        location: 'Localhost', 
        userAgent: navigator.userAgent,
        device: /Mobile|Android|iP(ad|hone)/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
        requestId: `req-${Math.random().toString(36).substr(2, 6)}`,
        metadata: { timestamp: Date.now() },
        timestamp: new Date().toISOString()
    };
    currentLogs.unshift(newLog);
};

export const getAuditLogs = async (user: User): Promise<AuditLog[]> => {
    if (user.role !== UserRole.ADMIN) throw new Error("Unauthorized");
    return currentLogs;
};

export const getFileSignedUrl = async (user: User, fileId: string): Promise<string> => {
    // Simulation of verifying permissions for specific file ID
    const file = currentFiles.find(f => f.id === fileId);
    if (!file) throw new Error("File not found");

    if (user.role === UserRole.CLIENT) {
        if (file.ownerId !== user.clientId) throw new Error("Access Denied: Owner Mismatch");
        if (file.metadata?.status !== 'APPROVED') throw new Error("Access Denied: Document not Approved");
    }

    // Log the access
    await logAction(user, 'DOWNLOAD', file.name);

    return `https://fake-s3-bucket.acosvital.com/${file.name}?token=signed-jwt-token`;
};
