'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Check } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignIn: () => void;
  selectedPlan?: string;
}

export default function SignUpModal({ isOpen, onClose, onSwitchToSignIn, selectedPlan }: SignUpModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const getPasswordStrength = (value: string): 'weak' | 'medium' | 'strong' => {
    if (value.length < 8) return 'weak';
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (hasUpper && hasLower && hasNumber) return 'strong';
    if (hasUpper || hasNumber) return 'medium';
    return 'weak';
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordStrength(getPasswordStrength(value));
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setIsEmailValid(validateEmail(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || password.length < 8 || password !== confirmPassword || !agreedToTerms) return;

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    onClose();
  };

  const handleClose = () => {
    onClose();
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setAgreedToTerms(false);
    setIsEmailValid(false);
    setPasswordStrength('weak');
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'weak': return 'bg-red-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-[#1a1a1a] border border-[#D4AF37]/30 text-white max-w-[90%] w-[500px] p-0 rounded-xl max-h-[90vh] overflow-y-auto">
        <div className="relative p-8">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-[#D4AF37] hover:text-[#f0ad42] transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>

          <h2 className="text-2xl font-bold text-[#D4AF37] mb-8">Create Your Account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-semibold text-[#D4AF37]">
                Full Name *
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-[#0a0a0a] border border-[#D4AF37]/20 text-white placeholder:text-[#606060] focus:border-[#D4AF37]"
              />
            </div>

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
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="bg-[#0a0a0a] border border-[#D4AF37]/20 text-white placeholder:text-[#606060] focus:border-[#D4AF37]"
              />
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'weak' ? 'bg-red-500' : 'bg-[#D4AF37]/30'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'medium' || passwordStrength === 'strong' ? 'bg-yellow-500' : 'bg-[#D4AF37]/30'}`} />
                    <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? 'bg-green-500' : 'bg-[#D4AF37]/30'}`} />
                  </div>
                  <p className="text-xs mt-1 text-[#a0a0a0]">
                    Min 8 characters, uppercase, lowercase, and number
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#D4AF37]">
                Confirm Password *
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-[#0a0a0a] border border-[#D4AF37]/20 text-white placeholder:text-[#606060] focus:border-[#D4AF37] pr-10"
                />
                {confirmPassword.length > 0 && password === confirmPassword && (
                  <Check size={20} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
                )}
              </div>
              {confirmPassword.length > 0 && password !== confirmPassword && (
                <p className="text-red-400 text-xs">Passwords do not match</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="border-[#D4AF37] data-[state=checked]:bg-[#D4AF37]"
              />
              <label
                htmlFor="terms"
                className="text-sm text-[#a0a0a0] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to{' '}
                <button type="button" className="text-[#D4AF37] hover:underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-[#D4AF37] hover:underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            <Button
              type="submit"
              disabled={!isEmailValid || password.length < 8 || password !== confirmPassword || !agreedToTerms || isLoading}
              className="w-full h-12 bg-[#D4AF37] text-black hover:bg-[#aa8c2d] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-[#a0a0a0]">
              Already have an account?{' '}
              <button
                onClick={() => {
                  handleClose();
                  onSwitchToSignIn();
                }}
                className="text-[#D4AF37] hover:underline font-semibold"
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
