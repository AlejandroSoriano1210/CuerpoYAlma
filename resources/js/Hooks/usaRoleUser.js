import { usePage } from '@inertiajs/react';

export function usaRoleUser() {
    const user = usePage().props.auth.user;

    return {
        user,
        hasRole: (role) => user?.roles?.includes(role),
        hasAnyRole: (roles) => roles.some(role => user?.roles?.includes(role)),
        hasAllRoles: (roles) => roles.every(role => user?.roles?.includes(role)),
    };
}
