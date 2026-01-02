import { FileNode, User, UserRole, AuditLog } from '../types.ts';
import { MOCK_FILES, MOCK_LOGS } from './mockData.ts';

// Simulate a database state
let currentFiles = [...MOCK_FILES];
let currentLogs = [...MOCK_LOGS];

export const getFiles = async (user: User, folderId: string | null): Promise<FileNode[]> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate latency

  return currentFiles.filter(file => {
    // 1. Match Parent Folder
    if (file.parentId !== folderId) return false;

    // 2. Security / Data Isolation Check
    if (user.role === UserRole.CLIENT) {
      // Client can ONLY see files owned by their clientId
      return file.ownerId === user.clientId;
    }

    // Admin and Quality can see everything
    return true;
  });
};

export const createFolder = async (user: User, parentId: string | null, name: string): Promise<FileNode | null> => {
  if (user.role === UserRole.CLIENT) return null; // Clients cannot create

  const newFolder: FileNode = {
    id: `new-${Date.now()}`,
    parentId,
    name,
    type: 'FOLDER' as any,
    updatedAt: new Date().toISOString().split('T')[0],
    ownerId: undefined 
  };

  currentFiles.push(newFolder);
  return newFolder;
};

export const searchFiles = async (user: User, query: string): Promise<FileNode[]> => {
  await new Promise(resolve => setTimeout(resolve, 400));
  const lowerQuery = query.toLowerCase();

  return currentFiles.filter(file => {
    const matchesName = file.name.toLowerCase().includes(lowerQuery);
    const matchesTag = file.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    if (!matchesName && !matchesTag) return false;

    // Security Check
    if (user.role === UserRole.CLIENT) {
      return file.ownerId === user.clientId;
    }
    return true;
  });
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