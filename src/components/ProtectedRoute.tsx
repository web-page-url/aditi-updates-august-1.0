import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserRole } from '../lib/authContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles = ['user', 'manager', 'admin'] }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [bypassProtection, setBypassProtection] = useState(false);
  const [hasRenderedOnce, setHasRenderedOnce] = useState(false);

  useEffect(() => {
    // Once we've successfully rendered with a user, mark it
    if (user && !isLoading) {
      setHasRenderedOnce(true);
    }
  }, [user, isLoading]);

  useEffect(() => {
    // Set a more generous timeout for initial load only
    const safetyTimeout = setTimeout(() => {
      if (isLoading && !hasRenderedOnce) {
        console.log('Protected route timeout reached for initial load');
        setTimeoutReached(true);
        
        // For dashboard routes, we'll allow rendering the children anyway
        if (router.pathname === '/dashboard' || 
            router.pathname.includes('/team-management') || 
            router.pathname.includes('/admin') ||
            router.pathname === '/user-dashboard') {
          console.log('Bypassing protection for protected route');
          setBypassProtection(true);
        }
      }
    }, 3000); // Reduced timeout

    // If authentication is done loading and there's no user, redirect to login
    if (!isLoading && !user && !hasRenderedOnce) {
      router.replace('/');
    }
    
    // Restrict managers from accessing the daily update form
    if (!isLoading && user && user.role === 'manager' && router.pathname === '/daily-update-form') {
      console.log('Manager attempting to access daily update form, redirecting to dashboard');
      router.replace('/dashboard');
      return;
    }
    
    // If user exists but doesn't have required role, redirect to appropriate page
    if (!isLoading && user && !allowedRoles.includes(user.role)) {
      // Redirect based on role
      switch(user.role) {
        case 'admin':
          router.replace('/dashboard');
          break;
        case 'manager':
          router.replace('/dashboard');
          break;
        case 'user':
          router.replace('/user-dashboard');
          break;
        default:
          router.replace('/');
      }
    }

    return () => clearTimeout(safetyTimeout);
  }, [isLoading, user, router, allowedRoles, hasRenderedOnce]);

  // If we have a user already and just switched tabs, show content immediately
  if (hasRenderedOnce && user && allowedRoles.includes(user.role)) {
    return <>{children}</>;
  }

  // If we've been loading too long and it's not an admin/manager route, redirect to login
  if (timeoutReached && !bypassProtection && !hasRenderedOnce) {
    console.log('Timeout reached on protected route, redirecting to login');
    router.replace('/');
    return <LoadingSpinner message="Redirecting to login..." />;
  }

  // If loading but we're bypassing protection, show the children
  if ((isLoading && bypassProtection) || (hasRenderedOnce && isLoading)) {
    console.log('Bypassing loading state or tab switch loading');
    return <>{children}</>;
  }

  // Still loading and not yet timed out, show spinner only for initial load
  if (isLoading && !hasRenderedOnce) {
    return <LoadingSpinner message="Checking permissions..." />;
  }

  // If not logged in or not authorized, and not bypassing, don't render children
  if ((!user || !allowedRoles.includes(user.role)) && !bypassProtection) {
    return <LoadingSpinner message="Redirecting..." />;
  }
  
  // User is authenticated and authorized (or we're bypassing)
  return <>{children}</>;
} 