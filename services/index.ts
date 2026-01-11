
import { IUserService, IFileService, IAdminService, INotificationService } from './interfaces.ts';
import { SupabaseUserService } from './supabaseUserService.ts';
import { SupabaseFileService } from './supabaseFileService.ts';
import { SupabaseAdminService } from './supabaseAdminService.ts';
import { MockNotificationService } from './notificationService.ts';

/**
 * Ponto de Injeção de Dependência.
 * Implementações reais conectadas ao Supabase Postgres.
 */

export const userService: IUserService = SupabaseUserService;
export const fileService: IFileService = SupabaseFileService;
export const adminService: IAdminService = SupabaseAdminService;
export const notificationService: INotificationService = MockNotificationService;
