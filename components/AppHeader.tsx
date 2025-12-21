'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
    <nav className="bg-card shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-foreground">Barnablood</h1>
            <div className="flex gap-4">
              <Link 
                href="/monsters" 
                className={pathname?.startsWith('/monsters') ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Monsters
              </Link>
              <Link 
                href="/combat" 
                className={pathname === '/combat' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}
              >
                Combat
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
