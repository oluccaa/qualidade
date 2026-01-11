
import { SupportTicket, MaintenanceEvent, User, UserRole, ClientOrganization, SystemStatus, FirewallRule, NetworkPort } from '../types.ts';
import { MOCK_TICKETS, MOCK_MAINTENANCE, MOCK_CLIENTS, MOCK_FIREWALL_RULES, MOCK_PORTS } from './mockData.ts';
import { IAdminService } from './interfaces.ts';

let tickets = [...MOCK_TICKETS];
let clients = [...MOCK_CLIENTS];
let currentSystemStatus: SystemStatus = { mode: 'ONLINE' };
const statusListeners: ((s: SystemStatus) => void)[] = [];

export const MockAdminService: IAdminService = {
    getSystemStatus: async () => ({ ...currentSystemStatus }),
    updateSystemStatus: async (user, newStatus) => {
        currentSystemStatus = { ...currentSystemStatus, ...newStatus };
        statusListeners.forEach(l => l(currentSystemStatus));
        return currentSystemStatus;
    },
    subscribeToSystemStatus: (listener) => {
        statusListeners.push(listener);
        return () => { const i = statusListeners.indexOf(listener); if (i > -1) statusListeners.splice(i, 1); };
    },
    getClients: async () => [...clients],
    saveClient: async (user, data) => {
        if (data.id) {
            const i = clients.findIndex(c => c.id === data.id);
            clients[i] = { ...clients[i], ...data } as ClientOrganization;
            return clients[i];
        }
        const nc = { id: `c-${Date.now()}`, name: data.name!, cnpj: data.cnpj!, status: data.status!, contractDate: data.contractDate! };
        clients.push(nc);
        return nc;
    },
    deleteClient: async (user, id) => { clients = clients.filter(c => c.id !== id); },
    getTickets: async () => [...tickets],
    getMyTickets: async (user) => tickets.filter(t => t.userId === user.id),
    getUserTickets: async (id) => tickets.filter(t => t.userId === id),
    getQualityInbox: async () => tickets.filter(t => t.flow === 'CLIENT_TO_QUALITY'),
    getAdminInbox: async () => tickets.filter(t => t.flow === 'QUALITY_TO_ADMIN'),
    createTicket: async (user, data) => {
        const nt: SupportTicket = { id: `t-${Date.now()}`, flow: user.role === UserRole.QUALITY ? 'QUALITY_TO_ADMIN' : 'CLIENT_TO_QUALITY', userId: user.id, userName: user.name, subject: data.subject!, description: data.description!, priority: data.priority!, status: 'OPEN', createdAt: new Date().toISOString() };
        tickets.unshift(nt);
        return nt;
    },
    resolveTicket: async (user, id, status, note) => {
        const i = tickets.findIndex(t => t.id === id);
        if (i !== -1) tickets[i] = { ...tickets[i], status, resolutionNote: note };
    },
    updateTicketStatus: async (user, id, status) => {
        const i = tickets.findIndex(t => t.id === id);
        if (i !== -1) tickets[i] = { ...tickets[i], status };
    },
    getFirewallRules: async () => [...MOCK_FIREWALL_RULES],
    getPorts: async () => [...MOCK_PORTS],
    getMaintenanceEvents: async () => [...MOCK_MAINTENANCE],
    scheduleMaintenance: async (user, data) => ({ ...data, id: 'm-new' } as any),
    cancelMaintenance: async (user, id) => {},
    requestInfrastructureSupport: async (user, data) => `EXT-${Date.now()}`
};
