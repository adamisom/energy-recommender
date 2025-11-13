'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/lib/auth/context';
import { safeClear } from '@/lib/utils/storage';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(loginEmail, loginPassword);

    if (error) {
      // Map technical error messages to user-friendly ones
      let userMessage = error.message;
      
      if (error.message?.includes('Invalid login credentials') || error.message?.includes('invalid')) {
        userMessage = 'Invalid email or password. Please try again.';
      } else if (error.message?.includes('Email not confirmed')) {
        userMessage = 'Please check your email and confirm your account before signing in.';
      } else if (error.message?.includes('rate limit')) {
        userMessage = 'Too many attempts. Please try again in a few minutes.';
      } else if (!error.message || error.message.includes('fetch')) {
        userMessage = 'Unable to sign in. Please check your connection and try again.';
      }
      
      setError(userMessage);
      setLoading(false);
    } else {
      // Clear sessionStorage on successful login
      safeClear();
      
      // Sync user to our Prisma database (in case they signed up before sync was added)
      try {
        await fetch('/api/user/sync', { method: 'POST' });
      } catch (error) {
        console.error('Failed to sync user after sign-in:', error);
        // Don't block sign-in if sync fails - it will sync lazily on first data save
      }
      
      onOpenChange(false);
      // Auth context will automatically update user state via onAuthStateChange
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signUp(signupEmail, signupPassword, signupName);

    if (error) {
      // Map technical error messages to user-friendly ones
      let userMessage = error.message;
      
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        userMessage = 'An account with this email already exists. Try signing in instead.';
      } else if (error.message?.includes('invalid') && error.message?.includes('email')) {
        userMessage = 'Please enter a valid email address.';
      } else if (error.message?.includes('password')) {
        userMessage = 'Password must be at least 6 characters long.';
      } else if (error.message?.includes('rate limit')) {
        userMessage = 'Too many attempts. Please try again in a few minutes.';
      } else if (!error.message || error.message.includes('fetch')) {
        userMessage = 'Unable to create account. Please check your connection and try again.';
      }
      
      setError(userMessage);
      setLoading(false);
    } else {
      // Clear sessionStorage on successful signup
      safeClear();
      
      // Sync user to our Prisma database immediately after sign-up
      try {
        await fetch('/api/user/sync', { method: 'POST' });
      } catch (error) {
        console.error('Failed to sync user after sign-up:', error);
        // Don't block sign-up if sync fails - it will sync lazily on first data save
      }
      
      onOpenChange(false);
      // Auth context will automatically update user state via onAuthStateChange
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in to save your data</DialogTitle>
          <DialogDescription>
            Create an account to save your usage data and recommendation history across devices.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="!grid !w-full grid-cols-2 h-auto">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="pt-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name (optional)</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="Your name"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-slate-500">
          You can continue using the app without an account. Your data will be stored locally in your browser.
        </p>
      </DialogContent>
    </Dialog>
  );
}

