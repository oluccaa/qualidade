import { FileNode, User, FileType, LibraryFilters, AuditLog, BreadcrumbItem } from '../types.ts';
import { IFileService, PaginatedResponse } from './interfaces.ts';
import { supabase } from './supabaseClient.ts';

export const SupabaseFileService: IFileService = {
    getFiles: async (user: User, folderId: string | null, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let query = supabase
            .from('files')
            .select('*', { count: 'exact' })
            .eq('parent_id', folderId || null);

        if (user.role === 'CLIENT') {
            query = query.eq('owner_id', user.clientId);
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
                metadata: f.metadata || {}
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
            metadata: f.metadata || {}
        }));
    },

    getFileSignedUrl: async (user: User, fileId: string): Promise<string> => {
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('name, owner_id, storage_path')
            .eq('id', fileId)
            .single();
            
        if (fetchError || !file) throw new Error("Documento não encontrado.");
        
        // Verifica permissão básica de cliente
        if (user.role === 'CLIENT' && file.owner_id !== user.clientId) {
            throw new Error("Acesso negado a este documento.");
        }

        const path = file.storage_path || `${file.owner_id}/${file.name}`;
        
        const { data, error } = await supabase.storage
            .from('certificates')
            .createSignedUrl(path, 3600); // 1 hora de validade
        
        if (error) throw error;
        return data.signedUrl;
    },

    getDashboardStats: async (user: User) => {
        const { count: total } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.clientId || '')
            .neq('type', 'FOLDER');

        const { count: pending } = await supabase
            .from('files')
            .select('*', { count: 'exact', head: true })
            .eq('owner_id', user.clientId || '')
            .eq('metadata->status', 'PENDING');
            
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
        
        if (user.role === 'CLIENT') query = query.eq('owner_id', user.clientId);
        if (filters.search) query = query.ilike('name', `%${filters.search}%`);
        if (filters.status && filters.status !== 'ALL') query = query.eq('metadata->status', filters.status);
        
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
                metadata: f.metadata || {}
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    createFolder: async (user: User, parentId: string | null, name: string, ownerId?: string): Promise<FileNode | null> => {
        const { data, error } = await supabase.from('files').insert({
            parent_id: parentId,
            name,
            type: 'FOLDER',
            owner_id: ownerId || user.clientId,
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

        // 1. Upload para o Storage
        const { error: storageError } = await supabase.storage
            .from('certificates')
            .upload(storagePath, fileData.fileBlob, {
                cacheControl: '3600',
                upsert: true
            });

        if (storageError) throw storageError;

        // 2. Persistência no Banco de Dados
        const { data, error: dbError } = await supabase.from('files').insert({
            parent_id: fileData.parentId || null,
            name: fileData.name,
            type: FileType.PDF, // Assume-se PDF para certificados da Vital
            size: `${(fileData.fileBlob.size / (1024 * 1024)).toFixed(2)} MB`,
            owner_id: ownerId,
            storage_path: storagePath,
            metadata: {
                ...fileData.metadata,
                status: fileData.metadata?.status || 'PENDING',
                uploaded_by: user.id
            },
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
            metadata: data.metadata
        };
    },

    deleteFile: async (user: User, fileId: string): Promise<void> => {
        // 1. Busca dados para deletar do Storage se necessário
        const { data: file, error: fetchError } = await supabase
            .from('files')
            .select('type, storage_path')
            .eq('id', fileId)
            .single();

        if (fetchError || !file) return;

        // 2. Deleta do Storage se não for pasta
        if (file.type !== 'FOLDER' && file.storage_path) {
            await supabase.storage.from('certificates').remove([file.storage_path]);
        }

        // 3. Deleta do Banco de Dados (cascade deve tratar filhos se implementado no DB)
        const { error } = await supabase.from('files').delete().eq('id', fileId);
        if (error) throw error;
    },

    updateFile: async (user: User, fileId: string, updates: Partial<FileNode>): Promise<void> => {
        const { error } = await supabase.from('files').update({
            name: updates.name,
            parent_id: updates.parentId,
            metadata: updates.metadata,
            updated_at: new Date().toISOString()
        }).eq('id', fileId);

        if (error) throw error;
    },

    searchFiles: async (user: User, query: string, page = 1, pageSize = 20): Promise<PaginatedResponse<FileNode>> => {
        let supabaseQuery = supabase
            .from('files')
            .select('*', { count: 'exact' })
            .ilike('name', `%${query}%`);

        if (user.role === 'CLIENT') {
            supabaseQuery = supabaseQuery.eq('owner_id', user.clientId);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        const { data, count, error } = await supabaseQuery.range(from, to).order('updated_at', { ascending: false });
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
                metadata: f.metadata || {}
            })),
            total: count || 0,
            hasMore: (count || 0) > to + 1
        };
    },

    getBreadcrumbs: (folderId: string | null): BreadcrumbItem[] => {
        // Implementação síncrona de recuperação de breadcrumbs baseada em cache local ou 
        // requereria fetch recursivo. Para o MVP, retornamos a raiz.
        return [{ id: 'root', name: 'Início' }];
    },

    toggleFavorite: async (user: User, fileId: string): Promise<boolean> => {
        // Implementar tabela de favoritos no futuro se necessário
        return false;
    },

    getFavorites: async (user: User): Promise<FileNode[]> => {
        return [];
    },

    getFilesByOwner: async (ownerId: string): Promise<FileNode[]> => {
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
            metadata: f.metadata || {}
        }));
    },

    logAction: async (user: User, action: string, target: string, severity: AuditLog['severity'] = 'INFO') => {
        await supabase.from('audit_logs').insert({
            user_id: user.id,
            action,
            target,
            severity,
            category: 'DATA',
            metadata: { user_role: user.role }
        });
    },

    getAuditLogs: async (user: User): Promise<AuditLog[]> => {
        const { data } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100);
        return (data || []).map(l => ({
            id: l.id,
            timestamp: l.created_at,
            userId: l.user_id,
            userName: 'Usuário Vital',
            userRole: '',
            action: l.action,
            category: l.category as any,
            target: l.target,
            severity: l.severity as any,
            status: 'SUCCESS',
            ip: l.ip || '0.0.0.0',
            location: '',
            userAgent: l.user_agent || '',
            device: '',
            metadata: l.metadata || {},
            requestId: ''
        }));
    },

    getMasterLibraryFiles: async () => [],

    importFilesFromMaster: async (user: User, fileIds: string[], targetFolderId: string, targetOwnerId: string): Promise<void> => {
        const { data: masterFiles, error: fetchError } = await supabase
            .from('files')
            .select('*')
            .in('id', fileIds);

        if (fetchError || !masterFiles) throw fetchError || new Error("Arquivos mestre não encontrados.");

        const newFiles = masterFiles.map(mf => ({
            name: mf.name,
            type: mf.type,
            size: mf.size,
            parent_id: targetFolderId,
            owner_id: targetOwnerId,
            storage_path: mf.storage_path,
            metadata: { ...mf.metadata, status: 'APPROVED', imported_at: new Date().toISOString() },
            updated_at: new Date().toISOString()
        }));

        const { error: insertError } = await supabase.from('files').insert(newFiles);
        if (insertError) throw insertError;

        await SupabaseFileService.logAction(user, 'IMPORT', `Importou ${newFiles.length} arquivos da biblioteca mestre`);
    }
};