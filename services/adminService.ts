
import { SupportTicket, MaintenanceEvent, User, UserRole } from '../types.ts';
import { MOCK_TICKETS, MOCK_MAINTENANCE } from './mockData.ts';
import * as fileService from './fileService.ts';
import * as notificationService from './notificationService.ts';

// In-memory state
let tickets = [...MOCK_TICKETS];
let maintenanceEvents = [...MOCK_MAINTENANCE];

// --- TICKETS ---

export const getTickets = async (): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...tickets];
};

// Get tickets specific to a user (Client/Quality view)
export const getUserTickets = async (userId: string): Promise<SupportTicket[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return tickets.filter(t => t.userId === userId);
};

export const createTicket = async (user: User, ticket: Partial<SupportTicket>): Promise<SupportTicket> => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const newTicket: SupportTicket = {
        id: `t-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        subject: ticket.subject || 'Sem assunto',
        description: ticket.description || '',
        priority: ticket.priority || 'MEDIUM',
        status: 'OPEN',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    tickets.unshift(newTicket);
    await fileService.logAction(user, 'TICKET_UPDATE', `Abriu chamado: ${newTicket.subject}`);

    // NOTIFICATION LOGIC
    // If a Client or Quality user creates a ticket, Notify Admins (Mocking 'u1' as main admin)
    if (user.role !== UserRole.ADMIN) {
        // In a real app, you might notify a group or role. Here we target the mock admin.
        await notificationService.addNotification(
            'u1', // Mock Admin ID
            'Novo Chamado de Suporte',
            `${user.name} abriu um chamado: ${newTicket.subject}`,
            'WARNING',
            '/admin' // Admin goes to tickets tab
        );
    }

    return newTicket;
};

export const updateTicketStatus = async (user: User, ticketId: string, newStatus: SupportTicket['status']): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const idx = tickets.findIndex(t => t.id === ticketId);
    
    if (idx !== -1) {
        const ticket = tickets[idx];
        tickets[idx] = { ...ticket, status: newStatus };
        await fileService.logAction(user, 'TICKET_UPDATE', `Atualizou status do chamado ${ticketId} para ${newStatus}`);

        // NOTIFICATION LOGIC
        // Notify the owner of the ticket that status changed
        if (ticket.userId !== user.id) {
            await notificationService.addNotification(
                ticket.userId,
                'Atualização de Chamado',
                `Seu chamado "${ticket.subject}" foi atualizado para: ${newStatus}`,
                newStatus === 'RESOLVED' ? 'SUCCESS' : 'INFO'
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

// --- INFRASTRUCTURE SUPPORT (VENDOR REQUEST) ---

export const requestInfrastructureSupport = async (user: User, data: { 
    component: string, 
    description: string, 
    severity: string,
    affectedContext?: string, // NEW
    module?: string, // NEW
    steps?: string // NEW
}): Promise<string> => {
    
    // Simulação de envio para sistema externo (ex: ServiceNow, Zendesk, Jira Service Desk)
    // O Webhook foi removido conforme solicitado.
    
    console.log("Enviando solicitação para Provedor Externo:", data);

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simula latência de API externa
    
    const protocolId = `EXT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    
    // Log internal action for audit
    await fileService.logAction(user, 'TICKET_UPDATE', `Solicitação Fornecedor [${protocolId}]: ${data.component} (${data.module})`);
    
    return protocolId;
};
