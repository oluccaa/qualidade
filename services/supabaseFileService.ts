
import { FileNode, User, FileType, LibraryFilters, AuditLog } from '../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

export const SupabaseFileService: IFileService = {
    getFiles: async (user, folderId, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase
            .from('files')
            .select('*', { count: 'exact' })
            .eq('parent_id', folderId || null);

        if (user.role === 'CLIENT') {
            query = query.eq('owner_id', user.clientId);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to).order('name');
        if (error) throw error;

        return {
            items: (data || []).map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getRecentFiles: async (user, limit = 20): Promise<FileNode[]> => {
        let query = supabase
            .from('files')
            .select('*')
            .neq('type', 'FOLDER')
            .limit(limit)
            .order('updated_at', { ascending: false });
            
        if (user.role === 'CLIENT') query = query.eq('owner_id', user.clientId);
        
        const { data, error } = await query;
        if (error) throw error;
        
        return (data || []).map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata
        }));
    },

    getFileSignedUrl: async (user, fileId): Promise<string> => {
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('name, owner_id, storage_path')
            .eq('id', fileId)
            .single();
            
        if (fetchError || !file) throw new Error("Documento não encontrado.");
        
        const path = file.storage_path || `${file.owner_id}/${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(path, 3600);
        
        if (error) throw error;
        return data.signedUrl;
    },

    getDashboardStats: async (user: User) => {
        const { count: total } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.clientId || '');
            
        return {
            mainLabel: user.role === 'CLIENT' ? 'Conformidade' : 'Gestão',
            subLabel: 'Arquivos Ativos',
            mainValue: 100,
            subValue: total || 0,
            pendingValue: 0,
            status: 'REGULAR'
        };
    },

    getLibraryFiles: async (user, filters, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase.from('files').select('*', { count: 'exact' }).neq('type', 'FOLDER');
        
        if (user.role === 'CLIENT') query = query.eq('owner_id', user.clientId);
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);
        
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        
        const { data, count, error } = await query.range(from, to).order('updated_at', { ascending: false });
        if (error) throw error;

        return {
            items: (data || []).map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: new Date(f.updated_at).toLocaleDateString(),
                ownerId: f.owner_id,
                metadata: f.metadata
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    logAction: async (user, action, target, severity = 'INFO') => {
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            target,
            severity,
            category: 'SYSTEM',
            metadata: { user_role: user.role }
        });
    },

    getAuditLogs: async (user) => {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({
            id: l.id,
            timestamp: l.created_at,
            userId: l.user_id,
            userName: 'SISTEMA',
            userRole: '',
            action: l.action,
            category: l.category as any,
            target: l.target,
            severity: l.severity as any,
            status: 'SUCCESS',
            ip: l.ip || '',
            location: '',
            userAgent: l.user_agent || '',
            device: '',
            metadata: l.metadata,
            requestId: ''
        }));
    },

    getFilesByOwner: async (ownerId) => {
        const { data } = await supabase.from('files').select('*').eq('owner_id', ownerId);
        return (data || []).map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata
        }));
    },

    getMasterLibraryFiles: async () => [],
    importFilesFromMaster: async () => {},
    createFolder: async (user, parentId, name, ownerId) => null,
    uploadFile: async (user, fileData, ownerId) => ({} as any),
    updateFile: async () => {},
    deleteFile: async () => {},
    searchFiles: async (user, query, page, pageSize) => ({ items: [], total: 0, hasMore: false }),
    getBreadcrumbs: () => [],
    toggleFavorite: async () => false,
    getFavorites: async (user) => []
};
