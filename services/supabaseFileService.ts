
import { FileNode, User, FileType, LibraryFilters } from '../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

export const SupabaseFileService: IFileService = {
    getFiles: async (user, folderId, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase
            .from('files')
            .select('*', { count: 'exact' })
            .eq('parent_id', folderId || null);

        if (user.role === 'CLIENT') {
            query = query.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to).order('name');
        if (error) throw error;

        return {
            items: data as FileNode[],
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getRecentFiles: async (user, limit = 20): Promise<FileNode[]> => {
        let query = supabase.from('files').select('*').neq('type', 'FOLDER').limit(limit).order('updated_at', { ascending: false });
        if (user.role === 'CLIENT') query = query.eq('owner_id', user.clientId);
        const { data, error } = await query;
        if (error) throw error;
        return data as FileNode[];
    },

    getFileSignedUrl: async (user, fileId): Promise<string> => {
        // Busca o path do arquivo no bucket
        const { data: file } = await supabase.from('files').select('name').eq('id', fileId).single();
        if (!file) throw new Error("Arquivo não encontrado");
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(`${user.clientId}/${file.name}`, 60);
        
        if (error) throw error;
        return data.signedUrl;
    },

    // Implementações simplificadas para exemplo
    getFilesByOwner: async (ownerId) => {
        const { data } = await supabase.from('files').select('*').eq('owner_id', ownerId);
        return data || [];
    },

    getMasterLibraryFiles: async () => [],
    importFilesFromMaster: async () => {},
    getLibraryFiles: async (user, filters, page, pageSize) => ({ items: [], total: 0, hasMore: false }),
    getDashboardStats: async (user) => ({ mainValue: 100, subValue: 0, pendingValue: 0 }),
    createFolder: async (user, parentId, name, ownerId) => null,
    uploadFile: async (user, fileData, ownerId) => ({} as any),
    updateFile: async () => {},
    deleteFile: async () => {},
    searchFiles: async (user, query, page, pageSize) => ({ items: [], total: 0, hasMore: false }),
    getBreadcrumbs: () => [],
    toggleFavorite: async () => false,
    getFavorites: async () => [],
    logAction: async () => {},
    getAuditLogs: async () => []
};
