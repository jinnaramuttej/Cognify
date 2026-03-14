'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Check } from 'lucide-react';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export default function SignInModal({ isOpen, onClose, onSwitchToSignUp }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || password.length < 8) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  const handleClose = () => {
    onClose();
    setEmail('');
    setPassword('');
    setIsEmailValid(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#D4AF37]/30 text-white max-w-[90%] w-[500px] p-0 rounded-xl">
        <div className="relative p-8">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-[#D4AF37] hover:text-[#f0ad42] transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-8">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#D4AF37]">
                Email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#D4AF37]/20 text-white placeholder:text-[#606060] focus:border-[#D4AF37] pr-10"
                />
                {isEmailValid && (
                  <Check size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {email.length > 0 && !isEmailValid && (
                <p className="text-red-400 text-xs">Please enter a valid email address</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-[#D4AF37]">
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#0a0a0a] border border-[#D4AF37]/20 text-white placeholder:text-[#606060] focus:border-[#D4AF37]"
              />
              {password.length > 0 && password.length < 8 && (
                <p className="text-red-400 text-xs">Password must be at least 8 characters</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button type="button" className="text-sm text-[#D4AF37] hover:underline">
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={!isEmailValid || password.length < 8 || isLoading}
              className="w-full h-12 bg-[#D4AF37] text-black hover:bg-[#aa8c2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a0a0a0]">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  handleClose();
                  onSwitchToSignUp();
                }}
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
