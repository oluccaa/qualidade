
import { FileNode, User, UserRole, AuditLog, FileType, LibraryFilters } from '../types.ts';
import { MOCK_FILES, MOCK_LOGS, MASTER_ORG_ID, MOCK_CLIENTS } from './mockData.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';

let currentFiles = [...MOCK_FILES];
let currentLogs = [...MOCK_LOGS];
const favoritesStore: Record<string, Set<string>> = {};

const paginate = <T>(items: T[], page: number = 1, pageSize: number = 20): PaginatedResponse<T> => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);
    return {
        items: paginatedItems,
        total: items.length,
        hasMore: end < items.length
    };
};

export const logAction = async (user: User, action: string, target: string, severity: AuditLog['severity'] = 'INFO') => {
    const newLog: AuditLog = {
        id: `log-${Date.now()}`, userId: user.id, userName: user.name, userRole: user.role,
        action, category: 'SYSTEM', target, severity, status: 'SUCCESS',
        ip: '127.0.0.1', location: 'Localhost', userAgent: navigator.userAgent,
        device: 'Desktop', requestId: `req-${Math.random()}`, metadata: {}, timestamp: new Date().toISOString()
    };
    currentLogs.unshift(newLog);
};

export const MockFileService: IFileService = {
    getFiles: async (user: User, folderId: string | null, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const filtered = currentFiles.filter(f => {
            if (f.parentId !== folderId) return false;
            if (user.role === UserRole.CLIENT) {
                return f.ownerId === user.clientId && (f.type === FileType.FOLDER || f.metadata?.status === 'APPROVED');
            }
            return true;
        }).map(f => ({ ...f, isFavorite: favoritesStore[user.id]?.has(f.id) || false }));
        
        return paginate(filtered, page, pageSize);
    },

    getFilesByOwner: async (ownerId: string): Promise<FileNode[]> => {
        return currentFiles.filter(f => f.ownerId === ownerId);
    },

    getMasterLibraryFiles: async (): Promise<FileNode[]> => {
        return currentFiles.filter(f => f.ownerId === MASTER_ORG_ID && f.type !== FileType.FOLDER);
    },

    importFilesFromMaster: async (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string): Promise<void> => {
        const masterFiles = currentFiles.filter(f => fileIds.includes(f.id));
        const newFiles = masterFiles.map(mf => ({
            ...mf, id: `copy-${Date.now()}-${Math.random()}`, parentId: targetFolderId,
            ownerId: targetOwnerId, updatedAt: new Date().toISOString().split('T')[0],
            metadata: { ...mf.metadata, status: 'APPROVED' as const }
        }));
        currentFiles.push(...newFiles);
        await logAction(user, 'IMPORT', `Importou ${newFiles.length} arquivos`);
    },

    getRecentFiles: async (user: User, limit = 20): Promise<FileNode[]> => {
        let files = currentFiles.filter(f => f.type !== FileType.FOLDER);
        if (user.role === UserRole.CLIENT) files = files.filter(f => f.ownerId === user.clientId && f.metadata?.status === 'APPROVED');
        return files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, limit);
    },

    getLibraryFiles: async (user: User, filters: LibraryFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        let files = currentFiles.filter(f => f.type !== FileType.FOLDER);
        if (user.role === UserRole.CLIENT) files = files.filter(f => f.ownerId === user.clientId && f.metadata?.status === 'APPROVED');
        
        const filtered = files.filter(file => {
            if (filters.startDate && file.updatedAt < filters.startDate) return false;
            if (filters.endDate && file.updatedAt > filters.endDate) return false;
            if (filters.status !== 'ALL' && file.metadata?.status !== filters.status) return false;
            if (filters.search) {
                const term = filters.search.toLowerCase();
                return file.name.toLowerCase().includes(term) || file.metadata?.batchNumber?.toLowerCase().includes(term);
            }
            return true;
        });

        return paginate(filtered, page, pageSize);
    },

    getDashboardStats: async (user: User) => {
        if (user.role === UserRole.CLIENT) {
            const files = currentFiles.filter(f => f.ownerId === user.clientId && f.metadata?.status === 'APPROVED');
            return { mainLabel: 'Conformidade', subLabel: 'Docs', mainValue: 100, subValue: files.length, pendingValue: 0, status: 'REGULAR' };
        }
        return { mainLabel: 'Eficiência', subLabel: 'Total', mainValue: 98, subValue: currentFiles.length, pendingValue: 4, status: 'REGULAR' };
    },

    createFolder: async (user: User, parentId: string | null, name: string, ownerId?: string): Promise<FileNode | null> => {
        const newFolder: FileNode = { id: `new-${Date.now()}`, parentId, name, type: FileType.FOLDER, updatedAt: new Date().toISOString().split('T')[0], ownerId };
        currentFiles.push(newFolder);
        return newFolder;
    },

    uploadFile: async (user: User, fileData: Partial<FileNode>, ownerId: string): Promise<FileNode> => {
        const newFile: FileNode = { id: `f-${Date.now()}`, parentId: fileData.parentId || null, name: fileData.name || '', type: FileType.PDF, updatedAt: new Date().toISOString().split('T')[0], ownerId, metadata: fileData.metadata };
        currentFiles.push(newFile);
        return newFile;
    },

    updateFile: async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
        const idx = currentFiles.findIndex(f => f.id === fileId);
        if (idx !== -1) currentFiles[idx] = { ...currentFiles[idx], ...updates };
    },

    deleteFile: async (user: User, fileId: string): Promise<void> => {
        currentFiles = currentFiles.filter(f => f.id !== fileId);
    },

    searchFiles: async (user: User, query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        await new Promise(resolve => setTimeout(resolve, 400));
        const term = query.toLowerCase();
        const filtered = currentFiles.filter(f => {
            const matches = f.name.toLowerCase().includes(term) || f.metadata?.batchNumber?.toLowerCase().includes(term);
            if (user.role === UserRole.CLIENT) return matches && f.ownerId === user.clientId && f.metadata?.status === 'APPROVED';
            return matches;
        });
        return paginate(filtered, page, pageSize);
    },

    getBreadcrumbs: (folderId: string | null) => {
        if (!folderId) return [{ id: 'root', name: 'Início' }];
        const crumbs = [];
        let curr: string | null = folderId;
        while (curr) {
            const f = currentFiles.find(x => x.id === curr);
            if (f) { crumbs.unshift({ id: f.id, name: f.name }); curr = f.parentId; } else curr = null;
        }
        crumbs.unshift({ id: 'root', name: 'Início' });
        return crumbs;
    },

    toggleFavorite: async (user: User, fileId: string): Promise<boolean> => {
        if (!favoritesStore[user.id]) favoritesStore[user.id] = new Set();
        const favs = favoritesStore[user.id];
        if (favs.has(fileId)) { favs.delete(fileId); return false; }
        favs.add(fileId); return true;
    },

    getFavorites: async (user: User): Promise<FileNode[]> => {
        const favs = favoritesStore[user.id] || new Set();
        return currentFiles.filter(f => favs.has(f.id));
    },

    getFileSignedUrl: async (user: User, fileId: string): Promise<string> => {
        return `https://cdn.acosvital.com/mock/${fileId}`;
    },

    logAction,

    getAuditLogs: async (user: User): Promise<AuditLog[]> => {
        return currentLogs;
    }
};
