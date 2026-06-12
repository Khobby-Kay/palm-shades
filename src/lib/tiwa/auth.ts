import { supabaseAdmin } from './supabase-admin';
import {
  hasAdminPermission,
  isSuperAdmin,
  normalizeAdminPermissions,
  type AdminPermissionKey,
} from '@/lib/admin/permissions';

/**
 * Shared server-side authentication utilities.
 * Use these in API routes and server actions to verify callers.
 */

export interface AuthResult {
    authenticated: boolean;
    user?: any;
    role?: string;
    permissions?: AdminPermissionKey[];
    error?: string;
}

async function loadProfile(userId: string) {
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('role, admin_permissions')
        .eq('id', userId)
        .single();

    if (error || !profile) return null;

    return {
        role: profile.role as string,
        permissions: normalizeAdminPermissions(profile.admin_permissions),
    };
}

/**
 * Get Supabase access token from request (Authorization header or sb-access-token cookie).
 */
export function getAuthToken(request: Request): string | null {
    const authHeader = request.headers.get('authorization');
    const bearer = authHeader?.replace(/^Bearer\s+/i, '').trim();
    if (bearer) return bearer;
    const cookie = request.headers.get('cookie') ?? '';
    const match = cookie.match(/\bsb-access-token=([^;]+)/);
    return match ? decodeURIComponent(match[1].trim()) : null;
}

/**
 * Verify that the request has a valid Supabase session
 * and optionally check for admin/staff role.
 */
export async function verifyAuth(
    request: Request,
    options: { requireAdmin?: boolean; permission?: string; requireSuperAdmin?: boolean } = {}
): Promise<AuthResult> {
    const token = getAuthToken(request);

    if (!token) {
        return { authenticated: false, error: 'Missing authorization token' };
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return { authenticated: false, error: 'Invalid or expired token' };
        }

        if (options.requireAdmin || options.requireSuperAdmin || options.permission) {
            const profile = await loadProfile(user.id);

            if (!profile) {
                return { authenticated: false, error: 'Could not verify user role' };
            }

            if (profile.role !== 'admin' && profile.role !== 'staff') {
                return { authenticated: false, error: 'Admin access required' };
            }

            if (options.requireSuperAdmin && !isSuperAdmin(profile.role)) {
                return { authenticated: false, error: 'Super admin access required' };
            }

            if (
                options.permission &&
                !hasAdminPermission(profile.role, profile.permissions, options.permission)
            ) {
                return { authenticated: false, error: 'Permission denied' };
            }

            return {
                authenticated: true,
                user,
                role: profile.role,
                permissions: profile.permissions,
            };
        }

        return { authenticated: true, user };
    } catch (err: any) {
        return { authenticated: false, error: err.message || 'Auth verification failed' };
    }
}

/**
 * Verify admin auth for server actions.
 * Requires passing the auth token from the client.
 */
export async function verifyAdminToken(
    token: string,
    options: { permission?: string; requireSuperAdmin?: boolean } = {}
): Promise<AuthResult> {
    if (!token) {
        return { authenticated: false, error: 'Missing token' };
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return { authenticated: false, error: 'Invalid or expired token' };
        }

        const profile = await loadProfile(user.id);

        if (!profile) {
            return { authenticated: false, error: 'Could not verify role' };
        }

        if (profile.role !== 'admin' && profile.role !== 'staff') {
            return { authenticated: false, error: 'Admin access required' };
        }

        if (options.requireSuperAdmin && !isSuperAdmin(profile.role)) {
            return { authenticated: false, error: 'Super admin access required' };
        }

        if (
            options.permission &&
            !hasAdminPermission(profile.role, profile.permissions, options.permission)
        ) {
            return { authenticated: false, error: 'Permission denied' };
        }

        return {
            authenticated: true,
            user,
            role: profile.role,
            permissions: profile.permissions,
        };
    } catch (err: any) {
        return { authenticated: false, error: err.message || 'Auth failed' };
    }
}

export async function verifySuperAdmin(request: Request): Promise<AuthResult> {
    return verifyAuth(request, { requireSuperAdmin: true });
}
