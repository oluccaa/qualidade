
import { FileNode, User, UserRole, AuditLog, FileType, LibraryFilters, FileMetadata } from '../types.ts';
import { MOCK_FILES, MOCK_LOGS, MASTER_ORG_ID } from './mockData.ts';

// Simulate a database state
let currentFiles = [...MOCK_FILES];
let currentLogs = [...MOCK_LOGS];

// In-memory store for favorites (User ID -> Set of File IDs)
const favoritesStore: Record<string, Set<string>> = {};

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
             return file.ownerId === user.clientId;
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
      return file.ownerId === user.clientId;
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
        name: mf.name // Keep original name (or could append "Copy")
    }));

    currentFiles.push(...newFiles);
    await logAction(user, 'UPLOAD', `Importou ${newFiles.length} arquivos do Repositório Mestre`);
};

// Get recent files (flat list) for dashboard or history view
export const getRecentFiles = async (user: User, limit: number = 20): Promise<FileNode[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let files = currentFiles.filter(f => f.type !== FileType.FOLDER);

    if (user.role === UserRole.CLIENT) {
        files = files.filter(f => f.ownerId === user.clientId);
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
        files = files.filter(f => f.ownerId === user.clientId);
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
            const matchesBatch = file.metadata?.batchNumber?.toLowerCase().includes(term);
            const matchesProduct = file.metadata?.productName?.toLowerCase().includes(term);
            const matchesInvoice = file.metadata?.invoiceNumber?.toLowerCase().includes(term);

            if (!matchesName && !matchesBatch && !matchesProduct && !matchesInvoice) return false;
        }

        return true;
    });

    return filtered.map(f => ({ ...f, isFavorite: isFileFavorite(user.id, f.id) }));
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
      return file.ownerId === user.clientId;
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

export const logAction = async (user: User, action: AuditLog['action'], target: string) => {
    const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        action,
        target,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
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

    if (user.role === UserRole.CLIENT && file.ownerId !== user.clientId) {
        throw new Error("Access Denied");
    }

    // Log the access
    await logAction(user, 'DOWNLOAD', file.name);

    return `https://fake-s3-bucket.acosvital.com/${file.name}?token=signed-jwt-token`;
};