import { IUserService, IFileService, IAdminService, INotificationService } from './interfaces.ts';
import { SupabaseUserService } from './supabaseUserService.ts';
import { SupabaseFileService } from './supabaseFileService.ts';
import { SupabaseAdminService } from './supabaseAdminService.ts';
import { SupabaseNotificationService } from './supabaseNotificationService.ts'; // Adicionado
import { SupabaseAppService } from './appService.tsx'; // Adicionado o novo serviço RPC

/**
 * Ponto de Injeção de Dependência da Aplicação.
 * 100% das implementações agora estão conectadas ao Supabase (Produção).
 */

export const userService: IUserService = SupabaseUserService;
export const fileService: IFileService = SupabaseFileService;
export const adminService: IAdminService = SupabaseAdminService;
export const notificationService: INotificationService = SupabaseNotificationService;

// Exportação do novo serviço otimizado para inicialização (RPC)
export const appService = SupabaseAppService;