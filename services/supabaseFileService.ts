
import { FileNode, User, FileType, LibraryFilters, AuditLog, BreadcrumbItem, MASTER_ORG_ID } from '../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

// In-memory fallback for favorites in this demo context
const _localFavorites = new Set<string>();

export const SupabaseFileService: IFileService = {
    getFiles: async (user: User, folderId: string | null, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase
            .from('files')
            .select('*', { count: 'exact' });

        // Correção 1: Uso correto de .is() para nulos em UUID
        if (folderId) {
            query = query.eq('parent_id', folderId);
        } else {
            query = query.is('parent_id', null);
        }

        if (user.role === 'CLIENT') {
            if (!user.clientId) throw new Error("Usuário cliente sem organização vinculada.");
            // Correção 2: Uso de ->> para extrair texto do JSONB
            query = query.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await query.range(from, to).order('type', { ascending: false }).order('name');
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
                metadata: f.metadata || {},
                isFavorite: _localFavorites.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getRecentFiles: async (user: User, limit = 20): Promise<FileNode[]> => {
        let query = supabase
            .from('files')
            .select('*')
            .neq('type', 'FOLDER')
            .limit(limit)
            .order('updated_at', { ascending: false });
            
        if (user.role === 'CLIENT') {
            if (!user.clientId) return [];
            // Correção: ->> para status
            query = query.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
        }
        
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
                metadata: f.metadata || {},
                isFavorite: _localFavorites.has(f.id)
        }));
    },

    getFileSignedUrl: async (user: User, fileId: string): Promise<string> => {
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('name, owner_id, storage_path')
            .eq('id', fileId)
            .single();
            
        if (fetchError || !file) throw new Error("Documento não encontrado.");
        
        if (user.role === 'CLIENT' && file.owner_id !== user.clientId) {
            throw new Error("Acesso negado: Este documento pertence a outra organização.");
        }

        const path = file.storage_path || `${file.owner_id}/${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(path, 3600);
        
        if (error) throw error;
        return data.signedUrl;
    },

    getDashboardStats: async (user: User) => {
        let queryTotal = supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .neq('type', 'FOLDER');

        let queryPending = supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('metadata->>status', 'PENDING'); // Correção: ->>

        if (user.role === 'CLIENT') {
            // Correção: Só aplica filtro se o clientId existir, evitando enviar "none" ou null literal
            if (user.clientId) {
                queryTotal = queryTotal.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
                queryPending = queryPending.eq('owner_id', user.clientId);
            } else {
                return { mainLabel: 'Aguardando', subLabel: 'Organização', mainValue: 0, subValue: 0, pendingValue: 0, status: 'PENDING' };
            }
        }
            
        const [{ count: total }, { count: pending }] = await Promise.all([
            queryTotal,
            queryPending
        ]);

        return {
            mainLabel: user.role === 'CLIENT' ? 'Conformidade' : 'Gestão',
            subLabel: 'Arquivos Ativos',
            mainValue: 100,
            subValue: total || 0,
            pendingValue: pending || 0,
            status: 'REGULAR'
        };
    },

    getLibraryFiles: async (user: User, filters: LibraryFilters, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase.from('files').select('*', { count: 'exact' }).neq('type', 'FOLDER');
        
        if (user.role === 'CLIENT') {
            if (user.clientId) query = query.eq('owner_id', user.clientId);
            query = query.eq('metadata->>status', 'APPROVED'); // Correção: ->>
        }
        
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);
        if (filters.status && filters.status !== 'ALL') query = query.eq('metadata->>status', filters.status); // Correção: ->>
        
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
                metadata: f.metadata || {},
                isFavorite: _localFavorites.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    createFolder: async (user: User, parentId: string | null, name: string, ownerId?: string): Promise<FileNode | null> => {
        const targetOwnerId = user.role === 'CLIENT' ? user.clientId : ownerId;
        const { data, error } = await supabase.from('files').insert({
            parent_id: parentId,
            name,
            type: 'FOLDER',
            owner_id: targetOwnerId,
            updated_at: new Date().toISOString()
        }).select().single();
        if (error) throw error;
        return {
            id: data.id,
            parentId: data.parent_id,
            name: data.name,
            type: FileType.FOLDER,
            updatedAt: new Date(data.updated_at).toLocaleDateString(),
            ownerId: data.owner_id,
            metadata: {}
        };
    },

    uploadFile: async (user: User, fileData: Partial<FileNode> & { fileBlob?: Blob }, ownerId: string): Promise<FileNode> => {
        if (!fileData.fileBlob || !fileData.name) throw new Error("Dados do arquivo incompletos para upload.");
        const storagePath = `${ownerId}/${fileData.name}`;
        const { error: storageError } = await supabase.storage.from('certificates').upload(storagePath, fileData.fileBlob, { cacheControl: '3600', upsert: true });
        if (storageError) throw storageError;
        const { data, error: dbError } = await supabase.from('files').insert({
            parent_id: fileData.parentId || null,
            name: fileData.name,
            type: FileType.PDF,
            size: `${(fileData.fileBlob.size / (1024 * 1024)).toFixed(2)} MB`,
            owner_id: ownerId,
            storage_path: storagePath,
            uploaded_by: user.id,
            metadata: { ...fileData.metadata, status: fileData.metadata?.status || 'PENDING' },
            updated_at: new Date().toISOString()
        }).select().single();
        if (dbError) throw dbError;
        return {
            id: data.id,
            parentId: data.parent_id,
            name: data.name,
            type: data.type as FileType,
            size: data.size,
            updatedAt: new Date(data.updated_at).toLocaleDateString(),
            ownerId: data.owner_id,
            metadata: data.metadata,
            isFavorite: _localFavorites.has(data.id)
        };
    },

    deleteFile: async (user: User, fileId: string): Promise<void> => {
        const { data: file } = await supabase.from('files').select('storage_path, owner_id').eq('id', fileId).single();
        if (!file) return;
        if (user.role === 'CLIENT' && file.owner_id !== user.clientId) throw new Error("Não permitido excluir arquivos de terceiros.");
        if (file.storage_path) await supabase.storage.from('certificates').remove([file.storage_path]);
        await supabase.from('files').delete().eq('id', fileId);
    },

    updateFile: async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
        await supabase.from('files').update({
            name: updates.name,
            parent_id: updates.parentId,
            metadata: updates.metadata,
            updated_at: new Date().toISOString()
        }).eq('id', fileId);
    },

    searchFiles: async (user: User, query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let q = supabase.from('files').select('*', { count: 'exact' }).ilike('name', `%${query}%`);
        if (user.role === 'CLIENT' && user.clientId) {
            q = q.eq('owner_id', user.clientId).eq('metadata->>status', 'APPROVED');
        }
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        const { data, count, error } = await q.range(from, to).order('updated_at', { ascending: false });
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
                metadata: f.metadata || {},
                isFavorite: _localFavorites.has(f.id)
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getBreadcrumbs: (folderId: string | null): BreadcrumbItem[] => [{ id: 'root', name: 'Início' }],

    toggleFavorite: async (user: User, fileId: string): Promise<boolean> => {
        if (_localFavorites.has(fileId)) {
            _localFavorites.delete(fileId);
            return false;
        } else {
            _localFavorites.add(fileId);
            return true;
        }
    },

    getFavorites: async (user: User): Promise<FileNode[]> => {
        if (_localFavorites.size === 0) return [];
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .in('id', Array.from(_localFavorites));
        
        if (error) throw error;
        return (data || []).map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata || {},
            isFavorite: true
        }));
    },

    getFilesByOwner: async (ownerId: string): Promise<FileNode[]> => {
        if (!ownerId) return [];
        const { data, error } = await supabase.from('files').select('*').eq('owner_id', ownerId);
        if (error) throw error;
        return (data || []).map(f => ({
            id: f.id,
            parentId: f.parent_id,
            name: f.name,
            type: f.type as FileType,
            size: f.size,
            updatedAt: new Date(f.updated_at).toLocaleDateString(),
            ownerId: f.owner_id,
            metadata: f.metadata || {},
            isFavorite: _localFavorites.has(f.id)
        }));
    },

    logAction: async (user: User, action: string, target: string, severity: AuditLog['severity'] = 'INFO') => {
        await supabase.from('audit_logs').insert({ user_id: user.id, action, target, severity, category: 'DATA', metadata: { user_role: user.role } });
    },

    getAuditLogs: async (user: User): Promise<AuditLog[]> => {
        if (user.role !== 'ADMIN') throw new Error("Acesso negado.");
        const { data } = await supabase.from('audit_logs').select('*, profiles(full_name, role)').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({
            id: l.id, timestamp: l.created_at, userId: l.user_id, userName: l.profiles?.full_name || 'Sistema', userRole: l.profiles?.role || 'SYSTEM',
            action: l.action, category: l.category as any, target: l.target, severity: l.severity as any, status: 'SUCCESS', ip: l.ip || '0.0.0.0',
            location: '', userAgent: l.user_agent || '', device: '', metadata: l.metadata || {}, requestId: ''
        }));
    },

    getMasterLibraryFiles: async () => {
        const { data, error } = await supabase.from('files').select('*').eq('owner_id', MASTER_ORG_ID).neq('type', 'FOLDER');
        if (error) throw error;
        return (data || []).map(f => ({
            id: f.id, parentId: f.parent_id, name: f.name, type: f.type as FileType, size: f.size, updatedAt: new Date(f.updated_at).toLocaleDateString(), ownerId: f.owner_id, metadata: f.metadata || {}, isFavorite: _localFavorites.has(f.id)
        }));
    },

    importFilesFromMaster: async (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string): Promise<void> => {
        const { data: masterFiles } = await supabase.from('files').select('*').in('id', fileIds);
        if (!masterFiles) return;
        const newFiles = masterFiles.map(mf => ({
            name: mf.name, type: mf.type, size: mf.size, parent_id: targetFolderId, owner_id: targetOwnerId, storage_path: mf.storage_path,
            metadata: { ...mf.metadata, status: 'APPROVED', imported_at: new Date().toISOString() }, updated_at: new Date().toISOString()
        }));
        await supabase.from('files').insert(newFiles);
    }
};
