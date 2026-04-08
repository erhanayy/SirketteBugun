import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnChangePassword = nextUrl.pathname === '/change-password';

            if (isOnDashboard) {
                if (isLoggedIn) {
                    // Force password change check
                    if (auth?.user?.forcePasswordChange) {
                        return Response.redirect(new URL('/change-password', nextUrl));
                    }
                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            } else if (isLoggedIn) {
                // If user must change password but is trying to go elsewhere (except logout or static assets)
                // We only enforce this if they are trying to navigate to main pages, generally handled by dashboard check above.
                // But if they are on / change-password, we let them be.
                if (auth?.user?.forcePasswordChange && !isOnChangePassword) {
                    return Response.redirect(new URL('/change-password', nextUrl));
                }

                // Redirect logged-in users away from login page to dashboard
                // BUT if they have pending contracts, we might want to let them go to /contracts/approve?
                // The authenticate action handles the initial redirect.
                // Here we just prevent them from seeing the login page.
                if (nextUrl.pathname === '/login') {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
            } else {
                // Not logged in
                // Protect /contracts route
                if (nextUrl.pathname.startsWith('/contracts')) {
                    return false; // Redirect to login
                }
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
