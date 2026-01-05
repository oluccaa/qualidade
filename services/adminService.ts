
import { SupportTicket, MaintenanceEvent, User, UserRole, ClientOrganization, TicketFlow, SystemStatus } from '../types.ts';
import { MOCK_TICKETS, MOCK_MAINTENANCE, MOCK_CLIENTS } from './mockData.ts';
import * as fileService from './fileService.ts';
import * as notificationService from './notificationService.ts';

// In-memory state
let tickets = [...MOCK_TICKETS];
let maintenanceEvents = [...MOCK_MAINTENANCE];
let clients = [...MOCK_CLIENTS]; 

// Global System Status (Persisted in Memory for Mock)
let currentSystemStatus: SystemStatus = {
    mode: 'ONLINE',
    message: '',
    scheduledStart: '',
    scheduledEnd: ''
};

// --- SYSTEM STATUS (MAINTENANCE MODE) ---

export const getSystemStatus = async (): Promise<SystemStatus> => {
    // Check if scheduled maintenance has started automatically
    if (currentSystemStatus.mode === 'SCHEDULED' && currentSystemStatus.scheduledStart) {
        const now = new Date();
        const start = new Date(currentSystemStatus.scheduledStart);
        if (now >= start) {
            currentSystemStatus.mode = 'MAINTENANCE';
        }
    }
    return { ...currentSystemStatus };
};

export const updateSystemStatus = async (user: User, newStatus: Partial<SystemStatus>): Promise<SystemStatus> => {
    const previousMode = currentSystemStatus.mode;
    
    currentSystemStatus = {
        ...currentSystemStatus,
        ...newStatus,
        updatedBy: user.name
    };

    // LOGIC: Notify users when coming BACK online
    if (previousMode === 'MAINTENANCE' && newStatus.mode === 'ONLINE') {
        await notificationService.addNotification(
            'ALL',
            '🟢 Sistema Online',
            'A manutenção foi concluída e o sistema está totalmente operacional.',
            'SUCCESS'
        );
        await fileService.logAction(user, 'MAINTENANCE_OFF', 'Sistema reaberto para todos os usuários.', 'INFO');
    }

    // LOGIC: Notify when maintenance starts/is activated manually
    if (previousMode !== 'MAINTENANCE' && newStatus.mode === 'MAINTENANCE') {
        await fileService.logAction(user, 'MAINTENANCE_ON', 'Sistema colocado em modo de manutenção (Bloqueio Total).', 'WARNING');
    }

    return currentSystemStatus;
};

// --- CLIENTS (EMPRESAS) ---

export const getClients = async (): Promise<ClientOrganization[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...clients];
};

export const saveClient = async (user: User, clientData: Partial<ClientOrganization>): Promise<ClientOrganization> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Update existing
    if (clientData.id) {
        const index = clients.findIndex(c => c.id === clientData.id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...clientData } as ClientOrganization;
            await fileService.logAction(user, 'UPDATE_SYSTEM', `Atualizou empresa: ${clients[index].name}`);
            return clients[index];
        }
    }

    // Create new
    const newClient: ClientOrganization = {
        id: `c-${Date.now()}`,
        name: clientData.name || 'Nova Empresa',
        cnpj: clientData.cnpj || '',
        status: clientData.status || 'ACTIVE',
        contractDate: clientData.contractDate || new Date().toISOString().split('T')[0]
    };
    
    clients.push(newClient);
    await fileService.logAction(user, 'CREATE_SYSTEM', `Cadastrou nova empresa: ${newClient.name}`);
    return newClient;
};

export const deleteClient = async (user: User, clientId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const clientName = clients.find(c => c.id === clientId)?.name;
    clients = clients.filter(c => c.id !== clientId);
    await fileService.logAction(user, 'DELETE_SYSTEM', `Removeu empresa: ${clientName}`);
};

// --- TICKETS (FLOW SYSTEM) ---

export const getTickets = async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...tickets];
};

// Retorna tickets onde o usuário é o CRIADOR (Meus Chamados)
export const getMyTickets = async (user: User): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tickets.filter(t => t.userId === user.id);
};

// Retorna tickets por ID de usuário (Para SupportModal)
export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tickets.filter(t => t.userId === userId);
};

// Retorna tickets que o Departamento de Qualidade deve atender (Cliente -> Qualidade)
export const getQualityInbox = async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tickets.filter(t => t.flow === 'CLIENT_TO_QUALITY');
};

// Retorna tickets que o Admin deve atender (Qualidade -> Admin)
export const getAdminInbox = async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tickets.filter(t => t.flow === 'QUALITY_TO_ADMIN');
};

export const createTicket = async (user: User, ticket: Partial<SupportTicket>): Promise<SupportTicket> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Determine Flow based on Creator Role
    let flow: TicketFlow = 'CLIENT_TO_QUALITY'; // Default for Clients
    if (user.role === UserRole.QUALITY) flow = 'QUALITY_TO_ADMIN';
    if (user.role === UserRole.ADMIN) flow = 'ADMIN_TO_DEV';

    const newTicket: SupportTicket = {
        id: `t-${Date.now()}`,
        flow,
        userId: user.id,
        userName: user.name,
        clientId: user.clientId, 
        subject: ticket.subject || 'Sem assunto',
        description: ticket.description || '',
        priority: ticket.priority || 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        updatedAt: new Date().toISOString()
    };
    tickets.unshift(newTicket);
    await fileService.logAction(user, 'TICKET_UPDATE', `Abriu chamado (${flow}): ${newTicket.subject}`);

    return newTicket;
};

export const resolveTicket = async (user: User, ticketId: string, status: SupportTicket['status'], resolutionNote?: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = tickets.findIndex(t => t.id === ticketId);
    
    if (idx !== -1) {
        const ticket = tickets[idx];
        
        // Security check: Quality can only resolve CLIENT_TO_QUALITY, Admin can resolve QUALITY_TO_ADMIN
        const isAuthorized = 
            (user.role === UserRole.QUALITY && ticket.flow === 'CLIENT_TO_QUALITY') ||
            (user.role === UserRole.ADMIN && ticket.flow === 'QUALITY_TO_ADMIN') ||
            (user.role === UserRole.ADMIN && ticket.flow === 'ADMIN_TO_DEV'); // Admin resolves their own external tickets manually if needed

        if (!isAuthorized && user.role !== UserRole.ADMIN) { // Admin overrides all
             console.warn("Unauthorized ticket update attempt");
             // In a real app throw error, but for mock we allow Admin to do anything
        }

        tickets[idx] = { 
            ...ticket, 
            status, 
            resolutionNote: resolutionNote || ticket.resolutionNote,
            updatedAt: new Date().toISOString()
        };
        
        await fileService.logAction(user, 'TICKET_UPDATE', `Alterou status do chamado ${ticketId} para ${status}`);

        // NOTIFICATION: Notify the creator of the ticket
        if (ticket.userId !== user.id) {
            await notificationService.addNotification(
                ticket.userId,
                'Status do Chamado Atualizado',
                `Seu chamado "${ticket.subject}" agora está: ${status}.`,
                status === 'RESOLVED' ? 'SUCCESS' : 'INFO'
            );
        }
    }
};

// Updates only the status of a ticket (for Admin grid view)
export const updateTicketStatus = async (user: User, ticketId: string, status: SupportTicket['status']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = tickets.findIndex(t => t.id === ticketId);
    
    if (idx !== -1) {
        const ticket = tickets[idx];
        
        tickets[idx] = { 
            ...ticket, 
            status, 
            updatedAt: new Date().toISOString()
        };
        
        await fileService.logAction(user, 'TICKET_UPDATE', `Atualizou status do chamado ${ticketId} para ${status}`);

        // NOTIFICATION: Notify the creator of the ticket
        if (ticket.userId !== user.id) {
            await notificationService.addNotification(
                ticket.userId,
                'Status do Chamado Atualizado',
                `Seu chamado "${ticket.subject}" agora está: ${status}.`,
                status === 'RESOLVED' ? 'SUCCESS' : 'INFO'
            );
        }
    }
};

// --- MAINTENANCE ---

export const getMaintenanceEvents = async (): Promise<MaintenanceEvent[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...maintenanceEvents];
};

export const scheduleMaintenance = async (user: User, event: Partial<MaintenanceEvent>): Promise<MaintenanceEvent> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Also update global system status if it's a schedule
    if (event.scheduledDate) {
        const start = new Date(event.scheduledDate);
        const end = new Date(start.getTime() + (event.durationMinutes || 60) * 60000);
        
        await updateSystemStatus(user, {
            mode: 'SCHEDULED',
            scheduledStart: start.toISOString(),
            scheduledEnd: end.toISOString(),
            message: event.description
        });
    }

    const newEvent: MaintenanceEvent = {
        id: `m-${Date.now()}`,
        title: event.title || 'Manutenção',
        scheduledDate: event.scheduledDate || new Date().toISOString(),
        durationMinutes: event.durationMinutes || 60,
        description: event.description || '',
        status: 'SCHEDULED',
        createdBy: user.name
    };
    maintenanceEvents.unshift(newEvent);
    await fileService.logAction(user, 'MAINTENANCE_SCHEDULE', `Agendou manutenção: ${newEvent.title}`);

    // NOTIFICATION LOGIC: Broadcast to ALL users
    await notificationService.addNotification(
        'ALL',
        '⚠️ Manutenção Agendada',
        `${newEvent.title} prevista para ${newEvent.scheduledDate}. Duração: ${newEvent.durationMinutes} min.`,
        'ALERT'
    );

    return newEvent;
};

export const cancelMaintenance = async (user: User, eventId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = maintenanceEvents.findIndex(m => m.id === eventId);
    
    // Reset system status if canceling pending maintenance
    if (currentSystemStatus.mode === 'SCHEDULED' || currentSystemStatus.mode === 'MAINTENANCE') {
        await updateSystemStatus(user, { mode: 'ONLINE', message: '' });
    }

    if (idx !== -1) {
        const event = maintenanceEvents[idx];
        maintenanceEvents[idx] = { ...event, status: 'CANCELLED' };
        await fileService.logAction(user, 'MAINTENANCE_SCHEDULE', `Cancelou manutenção: ${event.title}`);

        // Notify cancellation
        await notificationService.addNotification(
            'ALL',
            'Manutenção Cancelada',
            `A manutenção "${event.title}" foi cancelada. O sistema operará normalmente.`,
            'INFO'
        );
    }
};

// --- INFRASTRUCTURE SUPPORT (ADMIN -> EXTERNAL) ---

export const requestInfrastructureSupport = async (user: User, data: { 
    component: string, 
    description: string, 
    severity: string,
    affectedContext?: string,
    module?: string, 
    steps?: string 
}): Promise<string> => {
    
    console.log("Enviando solicitação para Provedor Externo:", data);

    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const protocolId = `EXT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Create an internal ticket record for tracking this external request
    await createTicket(user, {
        subject: `[EXTERNO] ${data.component}: ${data.description.substring(0, 30)}...`,
        description: `Protocolo Externo: ${protocolId}\nDetalhes: ${data.description}\nSeveridade: ${data.severity}`,
        priority: data.severity as any
    });

    await fileService.logAction(user, 'TICKET_UPDATE', `Solicitação Fornecedor [${protocolId}]`);
    
    return protocolId;
};
