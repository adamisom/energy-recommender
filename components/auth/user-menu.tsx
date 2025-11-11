'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { AuthModal } from './auth-modal';
import { safeClear } from '@/lib/utils/storage';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-20" />;
  }

  const handleSignOut = async () => {
    // Clear sessionStorage on logout
    safeClear();
    await signOut();
    // Reload to reset state
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="h-9 w-20 bg-slate-200 animate-pulse rounded" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600">
          {user.email}
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setShowAuthModal(true)}>
        Sign In
      </Button>
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </>
  );
}

