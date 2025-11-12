'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/context';
import { AuthModal } from './auth-modal';
import { safeClear, safeGetItem, safeSetItem, safeRemoveItem } from '@/lib/utils/storage';

const RECOMMENDATIONS_BUTTON_HOVERED_KEY = 'recommendations_button_hovered';

export function UserMenu() {
  const { user, loading, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hasHovered, setHasHovered] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Sync hover state with sessionStorage when user signs in
  useEffect(() => {
    if (user) {
      // Check if user has hovered in this session
      const hovered = safeGetItem<boolean>(RECOMMENDATIONS_BUTTON_HOVERED_KEY, false);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasHovered(hovered);
    }
  }, [user]);

  // Clear hover state when user signs out
  useEffect(() => {
    if (!user) {
      safeRemoveItem(RECOMMENDATIONS_BUTTON_HOVERED_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasHovered(false);
    }
  }, [user]);

  const shouldAnimate = user && !hasHovered;

  if (!mounted) {
    return <div className="h-9 w-20" />;
  }

  const handleSignOut = async () => {
    // Clear sessionStorage on logout
    safeClear();
    // Clear animation state for next session
    safeRemoveItem(RECOMMENDATIONS_BUTTON_HOVERED_KEY);
    await signOut();
    // Auth context will automatically update user state via onAuthStateChange
  };

  const handleRecommendationsButtonHover = () => {
    if (!hasHovered) {
      // First time hovering - save to sessionStorage and stop animating
      safeSetItem(RECOMMENDATIONS_BUTTON_HOVERED_KEY, true);
      setHasHovered(true);
    }
  };

  if (loading) {
    return (
      <div className="h-9 w-20 bg-slate-200 animate-pulse rounded" />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/recommendations">
          <Button 
            className={`${shouldAnimate ? 'animate-glow-pulse' : ''} bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200`}
            size="sm"
            onMouseEnter={handleRecommendationsButtonHover}
          >
            📊 My Recommendations
          </Button>
        </Link>
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

