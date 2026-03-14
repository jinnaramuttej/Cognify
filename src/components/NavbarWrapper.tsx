'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Header from './cognify/Header';

export function NavbarWrapper() {
    const pathname = usePathname();
    const { isAuthenticated } = useAuth();

    // Pages that use the landing page header
    const landingPages = ['/', '/pricing', '/auth/login', '/auth/signup'];
    const isLandingPage = landingPages.includes(pathname || '');

    // If authenticated and not on a specific landing page, show the app Navbar
    if (isAuthenticated && !isLandingPage) {
        return <Navbar currentPath={pathname} />;
    }

    // Otherwise show the landing header
    return <Header />;
}
