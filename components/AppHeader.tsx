'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { APP_VERSION } from '@/lib/version';

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const session = await response.json();
          setUserEmail(session?.user?.email || '');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    }
    
    loadUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
      toast.error('Failed to sign out');
    }
  };

  // Don't show header on login page
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="bg-card shadow-sm border-b border-border fixed-header" style={{ zIndex: 'var(--app-header-z)', height: 'var(--app-header-height)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link href="/monsters" className="flex items-center gap-3">
              <img src="/logo.png" alt="BarnaBlood Logo" width={40} height={40} className="rounded" />
              <span className="flex flex-col items-start">
                <span className="text-2xl font-bold" style={{ fontFamily: 'var(--font-cinzel)' }}>
                  <span className="text-foreground">Barna</span><span className="text-red-600">Blood</span>
                </span>
                <span className="text-xs text-muted-foreground version-number" style={{ fontSize: '0.65rem', marginTop: '-0.2rem', marginLeft: '0.1rem' }}>V {APP_VERSION}</span>
              </span>
            </Link>
            <div className="flex gap-4">
              <Link 
                href="/combat" 
                className={pathname === '/combat' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Combat
              </Link>
              <Link 
                href="/monsters" 
                className={pathname?.startsWith('/monsters') && !pathname?.startsWith('/monsters/features') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Monsters
              </Link>
              <Link 
                href="/monsters/features" 
                className={pathname?.startsWith('/monsters/features') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Monster Features
              </Link>
              <Link
                href="/changelog"
                className={pathname === '/changelog' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Changelog
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail || 'Loading...'}</span>
            <Button onClick={handleSignOut} variant="outline" size="sm">
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
