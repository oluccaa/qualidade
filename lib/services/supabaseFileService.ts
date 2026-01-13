
import { User, UserRole } from '../../types/auth.ts';
import { FileNode, FileType, LibraryFilters } from '../../types/file.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from '../supabaseClient.ts';
import { logAction } from './loggingService.ts';

export const SupabaseFileService: IFileService = {
    getFiles: async (user, folderId, page = 1, pageSize = 50): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase.from('files').select('*', { count: 'exact' });
        
        // PENTE FINO DE SEGURANÇA:
        if (user.role === UserRole.CLIENT) {
            if (!user.organizationId) {
                console.error("[FileService] Cliente sem organização vinculada!");
                return { items: [], total: 0, hasMore: false };
            }
            // 1. Só vê da sua empresa
            query = query.eq('owner_id', user.organizationId);
            // 2. Só vê se o analista de qualidade aprovou (usando metadados JSONB do seu schema)
            query = query.eq('metadata->>status', 'APPROVED');
        }

        if (folderId) {
            query = query.eq('parent_id', folderId);
        } else {
            query = query.is('parent_id', null);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query
            .range(from, to)
            .order('type', { ascending: false }) // Pastas no topo
            .order('name', { ascending: true });

        if (error) throw error;

        return {
            items: (data || []).map(f => ({
                id: f.id,
                parentId: f.parent_id,
                name: f.name,
                type: f.type as FileType,
                size: f.size,
                updatedAt: f.updated_at,
                ownerId: f.owner_id,
                metadata: f.metadata,
                storage_path: f.storage_path
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getRecentFiles: async (user, limit = 10) => {
        let query = supabase.from('files').select('*').neq('type', 'FOLDER');
        
        if (user.role === UserRole.CLIENT) {
            query = query.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
        }

        const { data } = await query.order('updated_at', { ascending: false }).limit(limit);
        return (data || []) as any;
    },

    getDashboardStats: async (user) => {
        // Estatísticas reais baseadas na role
        let queryTotal = supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER');
        let queryPending = supabase.from('files').select('*', { count: 'exact', head: true }).neq('type', 'FOLDER').eq('metadata->>status', 'PENDING');

        if (user.role === UserRole.CLIENT) {
            queryTotal = queryTotal.eq('owner_id', user.organizationId).eq('metadata->>status', 'APPROVED');
            queryPending = queryPending.eq('owner_id', user.organizationId).neq('metadata->>status', 'APPROVED');
        }

        const { count: total } = await queryTotal;
        const { count: pending } = await queryPending;

        return {
            mainValue: 100, 
            subValue: total || 0,
            pendingValue: pending || 0,
            status: pending && pending > 0 ? 'PENDING' : 'REGULAR',
            mainLabel: user.role === UserRole.CLIENT ? 'Conformidade de Lotes' : 'Status de Auditoria',
            subLabel: 'Arquivos Disponíveis'
        };
    },

    getFileSignedUrl: async (user, fileId) => {
        const { data: file, error } = await supabase.from('files').select('storage_path, owner_id, metadata').eq('id', fileId).single();
        if (error || !file) throw new Error("Documento não localizado.");

        // Bloqueio extra: Cliente só baixa se for dele e estiver APROVADO
        if (user.role === UserRole.CLIENT) {
            if (file.owner_id !== user.organizationId || file.metadata?.status !== 'APPROVED') {
                throw new Error("Acesso negado: Documento não liberado para sua organização.");
            }
        }

        const { data, error: sError } = await supabase.storage
            .from('certificates')
            .createSignedUrl(file.storage_path, 3600);

        if (sError) throw sError;
        await logAction(user, 'FILE_ACCESS', fileId, 'DATA');
        return data.signedUrl;
    },

    uploadFile: async (user, fileData, ownerId) => {
        const path = `${ownerId}/${Date.now()}_${fileData.name}`;
        const { error: sError } = await supabase.storage.from('certificates').upload(path, fileData.fileBlob!);
        if (sError) throw sError;

        const { data, error: dbError } = await supabase.from('files').insert({
            name: fileData.name,
            parent_id: fileData.parentId,
            type: 'PDF',
            size: `${(fileData.fileBlob!.size / 1024).toFixed(1)} KB`,
            owner_id: ownerId,
            storage_path: path,
            uploaded_by: user.id,
            metadata: { ...fileData.metadata, status: 'PENDING' }
        }).select().single();

        if (dbError) throw dbError;
        return data as any;
    },

    updateFile: async (user, fileId, updates) => {
        const { error } = await supabase.from('files').update({
            metadata: updates.metadata,
            name: updates.name,
            updated_at: new Date().toISOString()
        }).eq('id', fileId);
        if (error) throw error;
    },

    deleteFile: async (user, fileId) => {
        const { data } = await supabase.from('files').select('storage_path').eq('id', fileId).single();
        if (data?.storage_path) await supabase.storage.from('certificates').remove([data.storage_path]);
        await supabase.from('files').delete().eq('id', fileId);
    },

    createFolder: async (user, parentId, name, ownerId) => {
        const { data, error } = await supabase.from('files').insert({
            name, parent_id: parentId, type: 'FOLDER', owner_id: ownerId || user.organizationId
        }).select().single();
        if (error) throw error;
        return data as any;
    },

    getLibraryFiles: async (user, filters, page, pageSize) => { return SupabaseFileService.getFiles(user, null, page, pageSize); },
    searchFiles: async (user, q) => { return SupabaseFileService.getFiles(user, null); },
    getBreadcrumbs: async (id) => { return [{ id: 'root', name: 'Início' }]; },
    toggleFavorite: async (u, id) => { return true; },
    getFavorites: async (u) => { return []; },
    logAction: logAction,
    getAuditLogs: async (u) => { 
        const { data } = await supabase.from('audit_logs').select('*, profiles(full_name)').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({ ...l, userName: l.profiles?.full_name }));
    },
    getQualityAuditLogs: async (u) => { return SupabaseFileService.getAuditLogs(u); },
    getFilesByOwner: async (id) => {
        const { data } = await supabase.from('files').select('*').eq('owner_id', id);
        return (data || []) as any;
    }
};
