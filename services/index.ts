
import { IUserService, IFileService, IAdminService, INotificationService } from './interfaces.ts';
import { SupabaseUserService } from './supabaseUserService.ts';
import { SupabaseFileService } from './supabaseFileService.ts';
import { MockAdminService } from './adminService.ts'; // Manter mock até implementar as tabelas admin
import { MockNotificationService } from './notificationService.ts';

/**
 * Ponto de Injeção de Dependência.
 * Alteramos aqui para apontar para as implementações do Supabase.
 */

export const userService: IUserService = SupabaseUserService;
export const fileService: IFileService = SupabaseFileService;
export const adminService: IAdminService = MockAdminService;
export const notificationService: INotificationService = MockNotificationService;
